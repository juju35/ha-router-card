// Mock Home Assistant states, entity registries and device registries shaped like what each integration creates
// (translation keys, entity names, device classes, units, attributes), used by the screenshots and the tests.
// Fixed clock, so the screenshots do not change with the day they are taken: the screenshot script sets the page
// clock to NOW.
export const NOW = "2026-11-12T12:00:00Z";
const ago = (sec) => new Date(Date.parse(NOW) - sec * 1000).toISOString();

/**
 * One integration: `devices` { id: { name, model, sw_version, via } }, `rows` [entity id, device id, translation key
 * or null, state, attributes], `trackers` [[entity id, state]] (no device). All devices share one config entry.
 */
export const mock = (platform, devices, rows, trackers = []) => {
  const entry = `entry_${platform}`;
  const out = { states: {}, entities: {}, devices: {} };
  for (const [id, d] of Object.entries(devices)) {
    out.devices[id] = { id, name: d.name, model: d.model, sw_version: d.sw_version, via_device_id: d.via || null, config_entries: [entry], configuration_url: d.url };
  }
  for (const [entity_id, device_id, translation_key, state, attrs = {}] of rows) {
    // Friendly name: the device name and the entity's own name, as Home Assistant builds it.
    const dev = devices[device_id]?.name || "";
    const slug = dev.toLowerCase().replace(/[^a-z0-9]+/g, "_");
    const own = entity_id.split(".")[1].replace(new RegExp(`^${slug}_?`), "").replace(/_/g, " ");
    const name = own.replace(/\b(cpu|wan|ip|ssid|ap7)\b/g, (w) => w.toUpperCase()).replace(/^./, (c) => c.toUpperCase());
    const attributes = { friendly_name: own ? `${dev} ${name}`.trim() : dev, ...attrs };
    out.states[entity_id] = { entity_id, state: String(state), attributes, last_changed: ago(600) };
    out.entities[entity_id] = { entity_id, device_id, platform, translation_key: translation_key || undefined };
  }
  for (const [entity_id, state] of trackers) {
    out.states[entity_id] = { entity_id, state, attributes: { source_type: "router" }, last_changed: ago(3600) };
    out.entities[entity_id] = { entity_id, platform };
  }
  return out;
};

const rate = (unit = "kB/s") => ({ unit_of_measurement: unit, device_class: "data_rate", state_class: "measurement" });
const pct = { unit_of_measurement: "%", state_class: "measurement" };
const temp = { unit_of_measurement: "°C", device_class: "temperature", state_class: "measurement" };
const conn = { device_class: "connectivity" };
const clients = (n) => Array.from({ length: n }, (_, i) => [`device_tracker.client_${i + 1}`, i % 5 === 4 ? "not_home" : "home"]);

// UniFi Network (core `unifi`): a Dream Machine Pro gateway, two access points and a switch, each a device of the
// same config entry. The gateway's WAN port bandwidth, CPU / memory, temperatures, uptime, WAN latency and its
// firmware update.
const unifi = mock(
  "unifi",
  {
    udm: { name: "Dream Machine Pro", model: "UDM-Pro", sw_version: "4.3.6", url: "https://192.168.1.1" },
    ap1: { name: "AP Living room", model: "U7 Pro" },
    ap2: { name: "AP Office", model: "U6 Lite" },
    sw1: { name: "Switch Garage", model: "USW Lite 8 PoE" },
  },
  [
    ["sensor.dream_machine_pro_port_9_wan_rx", "udm", "port_bandwidth_rx", "61875.4", rate("kB/s")],
    ["sensor.dream_machine_pro_port_9_wan_tx", "udm", "port_bandwidth_tx", "4183.2", rate("kB/s")],
    ["sensor.dream_machine_pro_cpu_utilization", "udm", "device_cpu_utilization", "23", pct],
    ["sensor.dream_machine_pro_memory_utilization", "udm", "device_memory_utilization", "61", pct],
    ["sensor.dream_machine_pro_cpu_temperature", "udm", "device_sub_temperature", "64", temp],
    ["sensor.dream_machine_pro_local_temperature", "udm", "device_sub_temperature", "48", temp],
    ["sensor.dream_machine_pro_uptime", "udm", null, ago(18 * 86400 + 5 * 3600), { device_class: "timestamp" }],
    ["sensor.dream_machine_pro_wan_latency", "udm", "wan_latency", "11", { unit_of_measurement: "ms", device_class: "duration" }],
    ["sensor.dream_machine_pro_clients", "udm", "device_clients", "37", { state_class: "measurement" }],
    ["sensor.dream_machine_pro_state", "udm", "device_state", "connected", { device_class: "enum" }],
    ["button.dream_machine_pro_restart", "udm", null, "unknown", { device_class: "restart" }],
    ["update.dream_machine_pro", "udm", null, "on", { device_class: "firmware", installed_version: "4.3.6", latest_version: "4.4.2" }],
    ["sensor.ap_living_room_state", "ap1", "device_state", "connected", { device_class: "enum" }],
    ["sensor.ap_living_room_clients", "ap1", "device_clients", "18", {}],
    ["sensor.ap_office_state", "ap2", "device_state", "connected", { device_class: "enum" }],
    ["sensor.ap_office_clients", "ap2", "device_clients", "9", {}],
    ["sensor.switch_garage_state", "sw1", "device_state", "disconnected", { device_class: "enum" }],
    ["sensor.switch_garage_clients", "sw1", "device_clients", "0", {}],
    ["switch.home_wifi", "udm", "wlan_control", "on", {}],
    ["switch.guest_wifi", "udm", "wlan_control", "off", {}],
  ]
);
// The WAN state: a binary sensor of the gateway would come from another integration; UniFi gives the WAN latency.
unifi.states["binary_sensor.dream_machine_pro_internet"] = { entity_id: "binary_sensor.dream_machine_pro_internet", state: "on", attributes: conn, last_changed: ago(9000) };
unifi.entities["binary_sensor.dream_machine_pro_internet"] = { entity_id: "binary_sensor.dream_machine_pro_internet", device_id: "udm", platform: "unifi" };

// Firewalla Local (firewalla_local, custom): the box metrics as attributes of its System Status binary sensor, the
// speed test sensors, an AP7 access point with its client count.
const firewalla = mock(
  "firewalla_local",
  {
    box: { name: "Firewalla Gold Plus", model: "Gold Plus", sw_version: "1.981" },
    ap7: { name: "AP7 Upstairs", model: "AP7", via: "box" },
  },
  [
    [
      "binary_sensor.firewalla_gold_plus_system_status",
      "box",
      "system_status",
      "on",
      { device_class: "connectivity", uptime_seconds: 41 * 86400 + 7200, cpu_usage_1m: 7.4, memory_usage_percent: 38.2, wan_ip: "203.0.113.24", hosts_online: 46, hosts_total: 58 },
    ],
    ["sensor.firewalla_gold_plus_wan_speed_test_download", "box", "wan_speed_test_download", "938.4", rate("Mbit/s")],
    ["sensor.firewalla_gold_plus_wan_speed_test_upload", "box", "wan_speed_test_upload", "512.7", rate("Mbit/s")],
    ["sensor.firewalla_gold_plus_wan_speed_test_latency", "box", "wan_speed_test_latency", "6", { unit_of_measurement: "ms", device_class: "duration" }],
    ["sensor.firewalla_gold_plus_wan_ping_latency", "box", "wan_internet_quality_latency", "8.2", { unit_of_measurement: "ms", device_class: "duration" }],
    ["sensor.firewalla_gold_plus_wan_ping_packet_loss", "box", "wan_internet_quality_packet_loss", "0", { unit_of_measurement: "%" }],
    ["binary_sensor.firewalla_gold_plus_wan_failover", "box", "wan_failover", "off", { device_class: "problem" }],
    ["binary_sensor.firewalla_gold_plus_wan_home_fiber_status", "box", "network", "on", conn],
    ["switch.firewalla_gold_plus_ssid_home", "box", "ssid", "on", {}],
    ["binary_sensor.ap7_upstairs_ap_status", "ap7", "ap_status", "on", { device_class: "connectivity", client_count: 14 }],
  ]
);

// TP-Link Deco (tplink_deco, custom): hardcoded English names (no translation keys), the master Deco with the total
// client rates, each Deco a device linked to it with its CPU / memory, client count and online state.
const deco = mock(
  "tplink_deco",
  {
    m1: { name: "Living room Deco", model: "X50", sw_version: "1.2.1 Build 20250312" },
    m2: { name: "Office Deco", model: "X50", via: "m1" },
    m3: { name: "Garden Deco", model: "X20 Outdoor", via: "m1" },
  },
  [
    ["sensor.total_down", "m1", null, "5812.4", rate("kB/s")],
    ["sensor.total_up", "m1", null, "933.1", rate("kB/s")],
    ["sensor.living_room_deco_down", "m1", null, "4012.0", rate("kB/s")],
    ["sensor.living_room_deco_up", "m1", null, "512.0", rate("kB/s")],
    ["binary_sensor.living_room_deco_internet_online", "m1", null, "on", conn],
    ["binary_sensor.living_room_deco_deco_online", "m1", null, "on", conn],
    ["sensor.living_room_deco_cpu_usage", "m1", null, "18", pct],
    ["sensor.living_room_deco_cpu_usage_raw", "m1", null, "31", pct],
    ["sensor.living_room_deco_memory_usage", "m1", null, "54", pct],
    ["sensor.living_room_deco_connected_clients", "m1", null, "17", {}],
    ["sensor.living_room_deco_ip_address", "m1", null, "192.168.68.1", {}],
    ["binary_sensor.office_deco_deco_online", "m2", null, "on", conn],
    ["sensor.office_deco_connected_clients", "m2", null, "8", {}],
    ["sensor.office_deco_down", "m2", null, "1800.4", rate("kB/s")],
    ["binary_sensor.garden_deco_deco_online", "m3", null, "off", conn],
    ["sensor.garden_deco_connected_clients", "m3", null, "0", {}],
  ],
  clients(25)
);

// OPNsense (opnsense, hass-opnsense): English names, interface traffic rates, system telemetry, gateway status.
const opnsense = mock(
  "opnsense",
  { fw: { name: "OPNsense", model: "DEC850", sw_version: "25.7.6", url: "https://192.168.1.1" } },
  [
    ["sensor.opnsense_interface_wan_traffic_in_rate", "fw", null, "41260.2", rate("kB/s")],
    ["sensor.opnsense_interface_wan_traffic_out_rate", "fw", null, "3187.5", rate("kB/s")],
    ["sensor.opnsense_interface_lan_traffic_in_rate", "fw", null, "3001.0", rate("kB/s")],
    ["sensor.opnsense_interface_lan_traffic_out_rate", "fw", null, "40980.0", rate("kB/s")],
    ["sensor.opnsense_cpu_usage", "fw", null, "12", pct],
    ["sensor.opnsense_memory_used_percentage", "fw", null, "27", pct],
    ["sensor.opnsense_memory_swap_used_percentage", "fw", null, "0", pct],
    ["sensor.opnsense_filesystem_used_percentage_root", "fw", null, "18", pct],
    ["sensor.opnsense_system_load_average_one_minute", "fw", null, "0.42", {}],
    ["sensor.opnsense_system_boottime", "fw", null, ago(63 * 86400 + 4 * 3600), { device_class: "timestamp" }],
    ["sensor.opnsense_gateway_wan_gw_status", "fw", null, "online", {}],
    ["sensor.opnsense_gateway_wan_gw_delay", "fw", null, "9.4", { unit_of_measurement: "ms" }],
    ["sensor.opnsense_gateway_wan_gw_loss", "fw", null, "0", { unit_of_measurement: "%" }],
    ["sensor.opnsense_cpu_temperature", "fw", null, "52", temp],
    ["update.opnsense_firmware_updates_available", "fw", null, "off", {}],
  ],
  clients(12)
);

// ASUSWRT (core `asuswrt`): translation keys, rates in Mbit/s, CPU / memory, radio temperatures, last boot.
const asuswrt = mock(
  "asuswrt",
  { rt: { name: "RT-AX88U Pro", model: "RT-AX88U Pro", sw_version: "3.0.0.6.102_34791" } },
  [
    ["sensor.rt_ax88u_pro_download_speed", "rt", "download_speed", "212.4", rate("Mbit/s")],
    ["sensor.rt_ax88u_pro_upload_speed", "rt", "upload_speed", "31.8", rate("Mbit/s")],
    ["sensor.rt_ax88u_pro_cpu_usage", "rt", "cpu_usage", "9", pct],
    ["sensor.rt_ax88u_pro_memory_usage", "rt", "memory_usage", "48", pct],
    ["sensor.rt_ax88u_pro_cpu_temperature", "rt", "cpu_temperature", "71", temp],
    ["sensor.rt_ax88u_pro_2_4ghz_temperature", "rt", "24ghz_temperature", "58", { ...temp, friendly_name: "RT-AX88U Pro 2.4 GHz temperature" }],
    ["sensor.rt_ax88u_pro_5ghz_temperature", "rt", "5ghz_temperature", "63", { ...temp, friendly_name: "RT-AX88U Pro 5 GHz temperature" }],
    ["sensor.rt_ax88u_pro_last_boot", "rt", "last_boot", ago(9 * 86400 + 3 * 3600), { device_class: "timestamp" }],
    ["sensor.rt_ax88u_pro_devices_connected", "rt", "devices_connected", "29", {}],
    ["sensor.rt_ax88u_pro_load_avg_1m", "rt", "load_avg_1m", "0.88", {}],
  ],
  clients(29)
);

export const integrations = { unifi, firewalla, deco, opnsense, asuswrt };
// The reference router of the README's first screenshots.
export const { states, entities, devices } = unifi;
