// Discovery: each mock is shaped like what its integration really creates (translation keys or English names, device
// classes, units, attributes, devices), and the router must get the slots the card shows.
import assert from "node:assert/strict";
import { test } from "node:test";
import { integrations, mock } from "../scripts/mock-states.mjs";
import { load } from "./load.mjs";

const { discover, listDevices, boxFor, stateOf, onlineOf, fmtRate, toBps, bootSec, speedtestOf, kindOf, profileOf, cleanEntities, sameSig } = load("router-card.js", [
  "discover",
  "listDevices",
  "boxFor",
  "stateOf",
  "onlineOf",
  "fmtRate",
  "toBps",
  "bootSec",
  "speedtestOf",
  "kindOf",
  "profileOf",
  "cleanEntities",
  "sameSig",
]);
// Plain copies of objects built in the card's context, for deepEqual.
const plain = (v) => JSON.parse(JSON.stringify(v));
const rate = (unit = "kB/s") => ({ unit_of_measurement: unit, device_class: "data_rate" });
const pct = { unit_of_measurement: "%" };

test("UniFi: the gateway first, its WAN port rates, system, update, and its access points and switch", () => {
  const hass = integrations.unifi;
  assert.equal(listDevices(hass)[0].value, "udm");
  const box = discover(hass, undefined, {});
  assert.equal(box.kind, "router");
  const sc = box.scalars;
  assert.equal(sc.rate_down, "sensor.dream_machine_pro_port_9_wan_rx");
  assert.equal(sc.rate_up, "sensor.dream_machine_pro_port_9_wan_tx");
  assert.equal(sc.cpu, "sensor.dream_machine_pro_cpu_utilization");
  assert.equal(sc.ram, "sensor.dream_machine_pro_memory_utilization");
  assert.equal(sc.boot, "sensor.dream_machine_pro_uptime");
  assert.equal(sc.latency, "sensor.dream_machine_pro_wan_latency");
  assert.equal(sc.update, "update.dream_machine_pro");
  assert.equal(sc.reboot, "button.dream_machine_pro_restart");
  assert.equal(box.temps.length, 2);
  assert.deepEqual(plain(box.wifi.map((w) => w.id)).sort(), ["switch.guest_wifi", "switch.home_wifi"]);
  assert.deepEqual(plain(box.nodes.map((n) => n.name)), ["AP Living room", "AP Office", "Switch Garage"]);
  assert.equal(onlineOf(hass.states[box.nodes[2].online]), false);
});

test("UniFi: an access point picked as the device is drawn as an access point", () => {
  const hass = integrations.unifi;
  assert.equal(kindOf(profileOf("unifi"), hass.devices.ap1, {}), "ap");
  assert.equal(kindOf(profileOf("unifi"), hass.devices.udm, {}), "router");
  assert.equal(kindOf(profileOf("unifi"), hass.devices.udm, { kind: "firewall" }), "firewall");
});

test("Firewalla: metrics read from the system status attributes, speed test, AP7 with its clients", () => {
  const hass = integrations.firewalla;
  const box = discover(hass, undefined, {});
  assert.equal(box.kind, "firewall");
  const sc = box.scalars;
  assert.equal(stateOf(hass, sc.cpu).state, "7.4");
  assert.equal(stateOf(hass, sc.ram).state, "38.2");
  assert.equal(stateOf(hass, sc.ip).state, "203.0.113.24");
  assert.equal(stateOf(hass, sc.clients).state, "46");
  assert.equal(Math.round(bootSec(stateOf(hass, sc.boot))), 41 * 86400 + 7200);
  // The networks (LAN, VLAN, WAN) say whether a network is set up, not whether it is online.
  assert.equal(sc.wan, undefined);
  assert.equal(sc.st_down, "sensor.firewalla_gold_plus_wan_speed_test_download");
  assert.equal(sc.st_ping, "sensor.firewalla_gold_plus_wan_speed_test_latency");
  assert.equal(sc.latency, "sensor.firewalla_gold_plus_wan_ping_latency");
  assert.deepEqual(plain(speedtestOf(hass, box, {})), {
    download: "sensor.firewalla_gold_plus_wan_speed_test_download",
    upload: "sensor.firewalla_gold_plus_wan_speed_test_upload",
    ping: "sensor.firewalla_gold_plus_wan_speed_test_latency",
  });
  assert.deepEqual(plain(box.wifi.map((w) => w.id)), ["switch.firewalla_gold_plus_ssid_home"]);
  assert.equal(box.nodes.length, 1);
  assert.equal(stateOf(hass, box.nodes[0].clients).state, "14");
});

test("TP-Link Deco: the total rates, the smoothed CPU, every Deco with its clients, the main one first", () => {
  const hass = integrations.deco;
  const box = discover(hass, undefined, {});
  assert.equal(box.kind, "mesh");
  assert.equal(box.scalars.rate_down, "sensor.total_down");
  assert.equal(box.scalars.rate_up, "sensor.total_up");
  assert.equal(box.scalars.cpu, "sensor.living_room_deco_cpu_usage");
  assert.equal(box.scalars.wan, "binary_sensor.living_room_deco_internet_online");
  assert.equal(box.scalars.ip, undefined, "the Deco's own LAN address is not the WAN IP");
  assert.deepEqual(plain(box.nodes.map((n) => [n.name, !!n.main])), [
    ["Living room Deco", true],
    ["Garden Deco", false],
    ["Office Deco", false],
  ]);
  assert.equal(box.trackers.length, 25);
});

test("OPNsense: the WAN interface rates, not the LAN ones; gateway status, delay and loss; disk and load", () => {
  const hass = integrations.opnsense;
  const sc = discover(hass, undefined, {}).scalars;
  assert.equal(sc.rate_down, "sensor.opnsense_interface_wan_traffic_in_rate");
  assert.equal(sc.rate_up, "sensor.opnsense_interface_wan_traffic_out_rate");
  assert.equal(sc.ram, "sensor.opnsense_memory_used_percentage");
  assert.equal(sc.disk, "sensor.opnsense_filesystem_used_percentage_root");
  assert.equal(sc.load, "sensor.opnsense_system_load_average_one_minute");
  assert.equal(sc.wan, "sensor.opnsense_gateway_wan_gw_status");
  assert.equal(onlineOf(hass.states[sc.wan]), true);
  assert.equal(sc.loss, "sensor.opnsense_gateway_wan_gw_loss");
});

test("ASUSWRT: rates in Mbit/s, last boot, connected devices, radio temperatures", () => {
  const hass = integrations.asuswrt;
  const box = discover(hass, undefined, {});
  assert.equal(box.scalars.rate_down, "sensor.rt_ax88u_pro_download_speed");
  assert.equal(box.scalars.clients, "sensor.rt_ax88u_pro_devices_connected");
  assert.equal(box.temps.length, 3);
  assert.equal(fmtRate(toBps(hass.states[box.scalars.rate_down]), { language: "en" }, {}), "26.6 MB/s");
  assert.equal(fmtRate(toBps(hass.states[box.scalars.rate_down]), { language: "fr" }, { rate_unit: "bits" }), "212 Mb/s");
});

test("MikroTik: rates on the interface devices, the WAN one first; interfaces are not network devices", () => {
  const hass = mock(
    "mikrotik_router",
    {
      rb: { name: "Mikrotik hAP ax3", model: "C53UiG+5HPaxD2HPaxD", sw_version: "7.19" },
      e1: { name: "Mikrotik ether1-WAN", via: "rb" },
      e2: { name: "Mikrotik ether2", via: "rb" },
    },
    [
      ["sensor.mikrotik_hap_ax3_cpu_load", "rb", null, "4", pct],
      ["sensor.mikrotik_hap_ax3_memory_usage", "rb", null, "21", pct],
      ["sensor.mikrotik_hap_ax3_uptime", "rb", null, "2026-11-01T10:00:00+00:00", { device_class: "timestamp" }],
      ["sensor.mikrotik_ether2_tx", "e2", null, "800", rate("B/s")],
      ["sensor.mikrotik_ether2_rx", "e2", null, "100", rate("B/s")],
      ["sensor.mikrotik_ether1_wan_tx", "e1", null, "1200", rate("B/s")],
      ["sensor.mikrotik_ether1_wan_rx", "e1", null, "98000", rate("B/s")],
      ["binary_sensor.mikrotik_ether1_wan_connection", "e1", null, "on", { device_class: "connectivity" }],
    ]
  );
  const box = discover(hass, "rb", {});
  assert.equal(box.scalars.rate_down, "sensor.mikrotik_ether1_wan_rx");
  assert.equal(box.scalars.rate_up, "sensor.mikrotik_ether1_wan_tx");
  assert.equal(box.scalars.wan, "binary_sensor.mikrotik_ether1_wan_connection");
  assert.equal(box.nodes.length, 0);
  assert.deepEqual(plain(listDevices(hass).map((d) => d.value)), ["rb"]);
});

test("Linksys Velop and NETGEAR: the integration's own keys win (WAN status, speed test bandwidth)", () => {
  const velop = mock(
    "linksys_velop",
    { mesh: { name: "Velop Mesh", model: "Velop" } },
    [
      ["binary_sensor.velop_mesh_wan_status", "mesh", "wan_status", "on", { device_class: "connectivity" }],
      ["sensor.velop_mesh_wan_ip", "mesh", "wan_ip", "198.51.100.7", {}],
      ["sensor.velop_mesh_online_devices", "mesh", "online_devices", "21", {}],
      ["sensor.velop_mesh_download_bandwidth", "mesh", "download_bandwidth", "512", rate("Mbit/s")],
      ["sensor.velop_mesh_upload_bandwidth", "mesh", "upload_bandwidth", "48", rate("Mbit/s")],
      ["button.velop_mesh_reboot_the_whole_mesh", "mesh", "reboot_mesh", "unknown", { device_class: "restart" }],
    ]
  );
  const v = discover(velop, undefined, {}).scalars;
  assert.equal(v.wan, "binary_sensor.velop_mesh_wan_status");
  assert.equal(v.ip, "sensor.velop_mesh_wan_ip");
  assert.equal(v.clients, "sensor.velop_mesh_online_devices");
  assert.equal(v.st_down, "sensor.velop_mesh_download_bandwidth");
  assert.equal(v.rate_down, undefined, "a speed test result is not traffic");
  assert.equal(v.reboot, undefined, "rebooting the whole mesh is not the device's restart");
  const netgear = mock(
    "netgear",
    { r: { name: "Orbi RBR860", model: "RBR860" } },
    [
      ["sensor.orbi_rbr860_downlink_bandwidth", "r", "downlink_bandwidth", "940", rate("Mbit/s")],
      ["sensor.orbi_rbr860_cpu_utilization", "r", "cpu_utilization", "15", pct],
    ]
  );
  assert.equal(discover(netgear, undefined, {}).scalars.st_down, "sensor.orbi_rbr860_downlink_bandwidth");
});

test("an integration the card does not know: shown from the kind and words of its entities", () => {
  const hass = mock(
    "some_router",
    { r: { name: "Edge Router", model: "ER-X" } },
    [
      ["sensor.edge_router_wan_download", "r", "wan_download", "1500", rate("kB/s")],
      ["sensor.edge_router_wan_upload", "r", "wan_upload", "200", rate("kB/s")],
      ["sensor.edge_router_cpu", "r", "cpu", "12", pct],
      ["binary_sensor.edge_router_internet", "r", "internet", "on", { device_class: "connectivity" }],
    ]
  );
  assert.deepEqual(plain(listDevices(hass)), [], "not listed in the editor");
  const box = discover(hass, "r", {});
  assert.equal(box.profile.platform, "some_router");
  assert.equal(box.scalars.rate_down, "sensor.edge_router_wan_download");
  assert.equal(box.scalars.cpu, "sensor.edge_router_cpu");
  assert.equal(box.scalars.wan, "binary_sensor.edge_router_internet");
});

test("an integration with trackers only: the integration is the router, its trackers the clients", () => {
  const hass = mock("ruckus_unleashed", {}, [], [["device_tracker.phone", "home"], ["device_tracker.tv", "not_home"]]);
  assert.deepEqual(plain(listDevices(hass)), [{ value: "platform:ruckus_unleashed", label: "Ruckus Unleashed" }]);
  const box = discover(hass, undefined, {});
  assert.equal(box.kind, "ap");
  assert.equal(box.trackers.length, 2);
});

test("the entities option replaces the sensors found; empty pickers leave no option", () => {
  const hass = integrations.asuswrt;
  const box = boxFor(hass, { entities: { rate_down: "sensor.my_wan_rx", cpu: "" } });
  assert.equal(box.scalars.rate_down, "sensor.my_wan_rx");
  assert.equal(box.scalars.cpu, "sensor.rt_ax88u_pro_cpu_usage");
  assert.equal(cleanEntities({ cpu: "", speedtest: { download: "" } }), undefined);
  assert.deepEqual(plain(cleanEntities({ cpu: "sensor.x", speedtest: { ping: "sensor.p", upload: "" } })), { cpu: "sensor.x", speedtest: { ping: "sensor.p" } });
});

test("WAN and node states read from binary sensors and status sensors", () => {
  const s = (state) => ({ state, attributes: {} });
  assert.equal(onlineOf(s("on")), true);
  assert.equal(onlineOf(s("connected")), true);
  assert.equal(onlineOf(s("Online")), true);
  assert.equal(onlineOf(s("disconnected")), false);
  assert.equal(onlineOf(s("down")), false);
  assert.equal(onlineOf(s("upgrading")), null);
  assert.equal(onlineOf(s("unavailable")), null);
});

test("the render signature compares states by identity", () => {
  const a = {};
  assert.ok(sameSig([a, 1], [a, 1]));
  assert.ok(!sameSig([a, 1], [{}, 1]));
  assert.ok(!sameSig(undefined, [a]));
});
