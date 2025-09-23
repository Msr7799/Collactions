# 🖥️ System Optimization Report

**Generated:** 2025-09-20 10:00:29  
**Tool:** Ubuntu System Optimizer & Cleaner v3.0  
**System:** Ubuntu 25.04  
**Kernel:** 6.14.0-29-generic  
**Hostname:** mohd-OptiPlex-7450-AIO

---

## 📊 System Overview

| Metric | Value | Status |
|--------|-------|--------|
| Memory Usage | 36.1% | ✅ Good |
| Swap Usage | 23.0% | ✅ Good |
| Disk Usage | 57% | ✅ Good |
| CPU Load | 80.0% | ⚠️ High |

---

## 🔍 Performance Issues Detected

### 🚨 Critical Issues

#### Potential Infinite Loops

| PID | CPU % | Process |
|-----|-------|---------|
| PID | START% | `COMMAND ` |

#### Potential Memory Leaks

| PID | Memory % | Virtual Size (KB) | Process |
|-----|----------|-------------------|---------|
| 122777 | 7.9% | 15734816 | `/usr/share/windsurf/resources/app/extensions/windsurf/bin/language_server_linux_x64 --api_server_url https://server.self-serve.windsurf.com --run_child --enable_lsp --extension_server_port 46567 --ide_name windsurf --csrf_token 92d79730-fc28-4e15-aafa-98bfa00427e3 --random_port --inference_api_server_url https://inference.codeium.com --database_dir /home/msr/.codeium/windsurf/database/9c0694567290725d9dcba14ade58e297 --enable_index_service --enable_local_search --search_max_workspace_file_count 5000 --indexed_files_retention_period_days 30 --workspace_id file_home_msr_Desktop_collactions --sentry_telemetry --sentry_environment stable --codeium_dir .codeium/windsurf --parent_pipe_path /tmp/server_7c8f73cb2b4a5232 --windsurf_version 1.12.6 --stdin_initial_metadata ` |
| 120418 | 4.3% | 1224829116 | `/usr/share/windsurf/windsurf --type=renderer --crashpad-handler-pid=120312 --enable-crash-reporter=d1c060cf-23f6-4a81-bb0a-821760a082ae,no_channel --user-data-dir=/home/msr/.config/Windsurf --standard-schemes=vscode-webview,vscode-file --enable-sandbox --secure-schemes=vscode-webview,vscode-file --cors-schemes=vscode-webview,vscode-file --fetch-schemes=vscode-webview,vscode-file --service-worker-schemes=vscode-webview --code-cache-schemes=vscode-webview,vscode-file --app-path=/usr/share/windsurf/resources/app --enable-sandbox --enable-blink-features=HighlightAPI --js-flags=--nodecommit_pooled_pages --disable-blink-features=FontMatchingCTMigration,StandardizedBrowserZoom, --lang=en-US --num-raster-threads=4 --enable-main-frame-before-activation --renderer-client-id=4 --time-ticks-at-unix-epoch=-1758323361284387 --launch-time-ticks=21290898252 --shared-files=v8_context_snapshot_data:100 --field-trial-handle=3,i,6438376976639204673,9223008447080959175,262144 --enable-features=DocumentPolicyIncludeJSCallStacksInCrashReports --disable-features=CalculateNativeWinOcclusion,SpareRendererForSitePerProcess --variations-seed-version --vscode-window-config=vscode:2670283b-e1f7-4369-88e5-350dde18f9d2 ` |
| 144505 | 2.3% | 3924844 | `/snap/firefox/6782/usr/lib/firefox/firefox ` |
| 150120 | 1.6% | 2676516 | `/snap/firefox/6782/usr/lib/firefox/firefox -contentproc -isForBrowser -prefsHandle 0:46205 -prefMapHandle 1:276483 -jsInitHandle 2:223368 -parentBuildID 20250911093530 -sandboxReporter 3 -chrootClient 4 -ipcHandle 5 -initialChannelId {b13efa6d-e49a-4f0b-820c-233602dc40ff} -parentPid 144505 -crashReporter 6 -crashHelper 7 -greomni /snap/firefox/6782/usr/lib/firefox/omni.ja -appomni /snap/firefox/6782/usr/lib/firefox/browser/omni.ja -appDir /snap/firefox/6782/usr/lib/firefox/browser 14 tab ` |
| 121406 | 1.5% | 1216116756 | `/usr/share/windsurf/windsurf --max-old-space-size=3072 /usr/share/windsurf/resources/app/extensions/node_modules/typescript/lib/tsserver.js --useInferredProjectPerProjectRoot --enableTelemetry --cancellationPipeName /tmp/vscode-typescript1000/c51adcdd5bafa5ef2cf6/tscancellation-f0535c255ccb85a5f4f1.tmp* --globalPlugins typescript-essential-plugins --pluginProbeLocations /home/msr/.windsurf/extensions/zardoy.ts-essential-plugins-0.0.81-universal --locale en --noGetErrOnBackgroundUpdate --canUseWatchEvents --validateDefaultNpmLocation --useNodeIpc ` |
| 154303 | 1.3% | 2609744 | `/usr/bin/nautilus --gapplication-service ` |
| 120875 | 1.2% | 1219607636 | `/usr/share/windsurf/windsurf --type=utility --utility-sub-type=node.mojom.NodeService --lang=en-US --service-sandbox-type=none --host-resolver-rules=MAP a.localhost 127.0.0.1, MAP b.localhost 127.0.0.1, MAP c.localhost 127.0.0.1, MAP d.localhost 127.0.0.1, MAP e.localhost 127.0.0.1, MAP f.localhost 127.0.0.1, MAP g.localhost 127.0.0.1, MAP h.localhost 127.0.0.1, MAP i.localhost 127.0.0.1, MAP j.localhost 127.0.0.1, MAP k.localhost 127.0.0.1, MAP l.localhost 127.0.0.1, MAP m.localhost 127.0.0.1, MAP n.localhost 127.0.0.1, MAP o.localhost 127.0.0.1, MAP p.localhost 127.0.0.1, MAP q.localhost 127.0.0.1, MAP r.localhost 127.0.0.1, MAP s.localhost 127.0.0.1, MAP t.localhost 127.0.0.1, MAP u.localhost 127.0.0.1, MAP v.localhost 127.0.0.1, MAP w.localhost 127.0.0.1, MAP x.localhost 127.0.0.1, MAP y.localhost 127.0.0.1, MAP z.localhost 127.0.0.1 --dns-result-order=ipv4first --inspect-port=0 --crashpad-handler-pid=120312 --enable-crash-reporter=d1c060cf-23f6-4a81-bb0a-821760a082ae,no_channel --user-data-dir=/home/msr/.config/Windsurf --standard-schemes=vscode-webview,vscode-file --enable-sandbox --secure-schemes=vscode-webview,vscode-file --cors-schemes=vscode-webview,vscode-file --fetch-schemes=vscode-webview,vscode-file --service-worker-schemes=vscode-webview --code-cache-schemes=vscode-webview,vscode-file --shared-files=v8_context_snapshot_data:100 --field-trial-handle=3,i,6438376976639204673,9223008447080959175,262144 --enable-features=DocumentPolicyIncludeJSCallStacksInCrashReports --disable-features=CalculateNativeWinOcclusion,SpareRendererForSitePerProcess --variations-seed-version ` |
| 3575 | 0.8% | 4975620 | `/usr/bin/gnome-shell ` |
| 120258 | 0.6% | 1218133860 | `/usr/share/windsurf/windsurf ` |
| 144907 | 0.6% | 2569908 | `/snap/firefox/6782/usr/lib/firefox/firefox -contentproc -isForBrowser -prefsHandle 0:50837 -prefMapHandle 1:276483 -jsInitHandle 2:223368 -parentBuildID 20250911093530 -sandboxReporter 3 -chrootClient 4 -ipcHandle 5 -initialChannelId {0f9ef64f-1be7-4578-8635-f22cc4b2a7a4} -parentPid 144505 -crashReporter 6 -crashHelper 7 -greomni /snap/firefox/6782/usr/lib/firefox/omni.ja -appomni /snap/firefox/6782/usr/lib/firefox/browser/omni.ja -appDir /snap/firefox/6782/usr/lib/firefox/browser 5 tab ` |
| 121845 | 0.4% | 1216149568 | `/usr/share/windsurf/windsurf /home/msr/.windsurf/extensions/visualstudioexptteam.intellicode-api-usage-examples-0.2.9/dist/server/server.js --node-ipc --clientProcessId=120875 ` |
| 120330 | 0.4% | 34290224 | `/usr/share/windsurf/windsurf --type=gpu-process --crashpad-handler-pid=120312 --enable-crash-reporter=d1c060cf-23f6-4a81-bb0a-821760a082ae,no_channel --user-data-dir=/home/msr/.config/Windsurf --gpu-preferences=UAAAAAAAAAAgAAAEAAAAAAAAAAAAAAAAAABgAAEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQAAABAAAAAAAAAAEAAAAAAAAAAIAAAAAAAAAAgAAAAAAAAA --shared-files --field-trial-handle=3,i,6438376976639204673,9223008447080959175,262144 --enable-features=DocumentPolicyIncludeJSCallStacksInCrashReports --disable-features=CalculateNativeWinOcclusion,SpareRendererForSitePerProcess --variations-seed-version ` |
| 150180 | 0.4% | 2444496 | `/snap/firefox/6782/usr/lib/firefox/firefox -contentproc -isForBrowser -prefsHandle 0:46205 -prefMapHandle 1:276483 -jsInitHandle 2:223368 -parentBuildID 20250911093530 -sandboxReporter 3 -chrootClient 4 -ipcHandle 5 -initialChannelId {0725967a-daae-4678-a9cc-f0ba72da4bb2} -parentPid 144505 -crashReporter 6 -crashHelper 7 -greomni /snap/firefox/6782/usr/lib/firefox/omni.ja -appomni /snap/firefox/6782/usr/lib/firefox/browser/omni.ja -appDir /snap/firefox/6782/usr/lib/firefox/browser 15 tab ` |
| 150246 | 0.4% | 2444496 | `/snap/firefox/6782/usr/lib/firefox/firefox -contentproc -isForBrowser -prefsHandle 0:46205 -prefMapHandle 1:276483 -jsInitHandle 2:223368 -parentBuildID 20250911093530 -sandboxReporter 3 -chrootClient 4 -ipcHandle 5 -initialChannelId {f37eee36-5824-4bf8-9565-ef6f363a4eb8} -parentPid 144505 -crashReporter 6 -crashHelper 7 -greomni /snap/firefox/6782/usr/lib/firefox/omni.ja -appomni /snap/firefox/6782/usr/lib/firefox/browser/omni.ja -appDir /snap/firefox/6782/usr/lib/firefox/browser 16 tab ` |
| 150310 | 0.4% | 2444496 | `/snap/firefox/6782/usr/lib/firefox/firefox -contentproc -isForBrowser -prefsHandle 0:46205 -prefMapHandle 1:276483 -jsInitHandle 2:223368 -parentBuildID 20250911093530 -sandboxReporter 3 -chrootClient 4 -ipcHandle 5 -initialChannelId {50003e7f-3f41-449c-b817-7615324ce7ed} -parentPid 144505 -crashReporter 6 -crashHelper 7 -greomni /snap/firefox/6782/usr/lib/firefox/omni.ja -appomni /snap/firefox/6782/usr/lib/firefox/browser/omni.ja -appDir /snap/firefox/6782/usr/lib/firefox/browser 17 tab ` |
| 144757 | 0.3% | 2494152 | `/snap/firefox/6782/usr/lib/firefox/firefox -contentproc -isForBrowser -prefsHandle 0:40625 -prefMapHandle 1:276483 -jsInitHandle 2:223368 -parentBuildID 20250911093530 -sandboxReporter 3 -chrootClient 4 -ipcHandle 5 -initialChannelId {52309114-8fb8-4232-8a5b-0c54534bb8f8} -parentPid 144505 -crashReporter 6 -crashHelper 7 -greomni /snap/firefox/6782/usr/lib/firefox/omni.ja -appomni /snap/firefox/6782/usr/lib/firefox/browser/omni.ja -appDir /snap/firefox/6782/usr/lib/firefox/browser 3 tab ` |
| 3595 | 0.3% | 1405900 | `/usr/libexec/mutter-x11-frames ` |
| 32020 | 0.3% | 3215340 | `gjs /usr/share/gnome-shell/extensions/ding@rastersoft.com/app/ding.js -E -P /usr/share/gnome-shell/extensions/ding@rastersoft.com/app ` |

### ⚠️ High Resource Usage

#### High CPU Usage Processes

| PID | CPU % | Process |
|-----|-------|---------|
| PID | START% | `COMMAND ` |

---

## 🏥 System Health Issues

### ✅ System Health: Excellent

No health issues detected.

---

## 📋 Detailed System Information

### Hardware Information
| Component | Details |
|-----------|---------|
| CPU | Intel(R) Core(TM) i7-7700 CPU @ 3.60GHz |
| CPU Cores | 8 cores |
| Architecture | x86_64 |
| Total RAM | 14Gi |
| Total Swap | 9Gi |

### Storage Information
| Mount Point | Size | Used | Available | Use% |
|-------------|------|------|-----------|------|
| / | 234G | 125G | 98G | 57% |
| /boot/efi | 300M | 11M | 289M | 4% |

### Network Interfaces
| Interface | Status | IP Address |
|-----------|--------|------------|
| lo: | ❌ Down | <LOOPBACK,UP,LOWER_UP> |
| enp0s31f<BROADCAST,MULTICAST,UP,LOWER_UP> | ✅ Up | mtu |
| wlp3s<BROADCAST,MULTICAST,UP,LOWER_UP> | ✅ Up | mtu |

### Running Services
| Service | Status |
|---------|--------|
| accounts-daemon.service | ✅ Running |
| anydesk.service | ✅ Running |
| avahi-daemon.service | ✅ Running |
| bluetooth.service | ✅ Running |
| colord.service | ✅ Running |
| cron.service | ✅ Running |
| cups-browsed.service | ✅ Running |
| cups.service | ✅ Running |
| dbus.service | ✅ Running |
| fwupd.service | ✅ Running |

---

## 🎯 Optimization Recommendations

### 🚨 Critical Actions Required

1. **Infinite Loops Detected:** Kill or restart the following processes:
   - PID PID: `COMMAND ` (CPU: START%)
     

2. **Memory Leaks Detected:** Monitor and restart these processes:
   - PID 122777: `/usr/share/windsurf/resources/app/extensions/windsurf/bin/language_server_linux_x64 --api_server_url https://server.self-serve.windsurf.com --run_child --enable_lsp --extension_server_port 46567 --ide_name windsurf --csrf_token 92d79730-fc28-4e15-aafa-98bfa00427e3 --random_port --inference_api_server_url https://inference.codeium.com --database_dir /home/msr/.codeium/windsurf/database/9c0694567290725d9dcba14ade58e297 --enable_index_service --enable_local_search --search_max_workspace_file_count 5000 --indexed_files_retention_period_days 30 --workspace_id file_home_msr_Desktop_collactions --sentry_telemetry --sentry_environment stable --codeium_dir .codeium/windsurf --parent_pipe_path /tmp/server_7c8f73cb2b4a5232 --windsurf_version 1.12.6 --stdin_initial_metadata ` (Memory: 7.9%, VSZ: 15734816KB)
   - PID 120418: `/usr/share/windsurf/windsurf --type=renderer --crashpad-handler-pid=120312 --enable-crash-reporter=d1c060cf-23f6-4a81-bb0a-821760a082ae,no_channel --user-data-dir=/home/msr/.config/Windsurf --standard-schemes=vscode-webview,vscode-file --enable-sandbox --secure-schemes=vscode-webview,vscode-file --cors-schemes=vscode-webview,vscode-file --fetch-schemes=vscode-webview,vscode-file --service-worker-schemes=vscode-webview --code-cache-schemes=vscode-webview,vscode-file --app-path=/usr/share/windsurf/resources/app --enable-sandbox --enable-blink-features=HighlightAPI --js-flags=--nodecommit_pooled_pages --disable-blink-features=FontMatchingCTMigration,StandardizedBrowserZoom, --lang=en-US --num-raster-threads=4 --enable-main-frame-before-activation --renderer-client-id=4 --time-ticks-at-unix-epoch=-1758323361284387 --launch-time-ticks=21290898252 --shared-files=v8_context_snapshot_data:100 --field-trial-handle=3,i,6438376976639204673,9223008447080959175,262144 --enable-features=DocumentPolicyIncludeJSCallStacksInCrashReports --disable-features=CalculateNativeWinOcclusion,SpareRendererForSitePerProcess --variations-seed-version --vscode-window-config=vscode:2670283b-e1f7-4369-88e5-350dde18f9d2 ` (Memory: 4.3%, VSZ: 1224829116KB)
   - PID 144505: `/snap/firefox/6782/usr/lib/firefox/firefox ` (Memory: 2.3%, VSZ: 3924844KB)
   - PID 150120: `/snap/firefox/6782/usr/lib/firefox/firefox -contentproc -isForBrowser -prefsHandle 0:46205 -prefMapHandle 1:276483 -jsInitHandle 2:223368 -parentBuildID 20250911093530 -sandboxReporter 3 -chrootClient 4 -ipcHandle 5 -initialChannelId {b13efa6d-e49a-4f0b-820c-233602dc40ff} -parentPid 144505 -crashReporter 6 -crashHelper 7 -greomni /snap/firefox/6782/usr/lib/firefox/omni.ja -appomni /snap/firefox/6782/usr/lib/firefox/browser/omni.ja -appDir /snap/firefox/6782/usr/lib/firefox/browser 14 tab ` (Memory: 1.6%, VSZ: 2676516KB)
   - PID 121406: `/usr/share/windsurf/windsurf --max-old-space-size=3072 /usr/share/windsurf/resources/app/extensions/node_modules/typescript/lib/tsserver.js --useInferredProjectPerProjectRoot --enableTelemetry --cancellationPipeName /tmp/vscode-typescript1000/c51adcdd5bafa5ef2cf6/tscancellation-f0535c255ccb85a5f4f1.tmp* --globalPlugins typescript-essential-plugins --pluginProbeLocations /home/msr/.windsurf/extensions/zardoy.ts-essential-plugins-0.0.81-universal --locale en --noGetErrOnBackgroundUpdate --canUseWatchEvents --validateDefaultNpmLocation --useNodeIpc ` (Memory: 1.5%, VSZ: 1216116756KB)
   - PID 154303: `/usr/bin/nautilus --gapplication-service ` (Memory: 1.3%, VSZ: 2609744KB)
   - PID 120875: `/usr/share/windsurf/windsurf --type=utility --utility-sub-type=node.mojom.NodeService --lang=en-US --service-sandbox-type=none --host-resolver-rules=MAP a.localhost 127.0.0.1, MAP b.localhost 127.0.0.1, MAP c.localhost 127.0.0.1, MAP d.localhost 127.0.0.1, MAP e.localhost 127.0.0.1, MAP f.localhost 127.0.0.1, MAP g.localhost 127.0.0.1, MAP h.localhost 127.0.0.1, MAP i.localhost 127.0.0.1, MAP j.localhost 127.0.0.1, MAP k.localhost 127.0.0.1, MAP l.localhost 127.0.0.1, MAP m.localhost 127.0.0.1, MAP n.localhost 127.0.0.1, MAP o.localhost 127.0.0.1, MAP p.localhost 127.0.0.1, MAP q.localhost 127.0.0.1, MAP r.localhost 127.0.0.1, MAP s.localhost 127.0.0.1, MAP t.localhost 127.0.0.1, MAP u.localhost 127.0.0.1, MAP v.localhost 127.0.0.1, MAP w.localhost 127.0.0.1, MAP x.localhost 127.0.0.1, MAP y.localhost 127.0.0.1, MAP z.localhost 127.0.0.1 --dns-result-order=ipv4first --inspect-port=0 --crashpad-handler-pid=120312 --enable-crash-reporter=d1c060cf-23f6-4a81-bb0a-821760a082ae,no_channel --user-data-dir=/home/msr/.config/Windsurf --standard-schemes=vscode-webview,vscode-file --enable-sandbox --secure-schemes=vscode-webview,vscode-file --cors-schemes=vscode-webview,vscode-file --fetch-schemes=vscode-webview,vscode-file --service-worker-schemes=vscode-webview --code-cache-schemes=vscode-webview,vscode-file --shared-files=v8_context_snapshot_data:100 --field-trial-handle=3,i,6438376976639204673,9223008447080959175,262144 --enable-features=DocumentPolicyIncludeJSCallStacksInCrashReports --disable-features=CalculateNativeWinOcclusion,SpareRendererForSitePerProcess --variations-seed-version ` (Memory: 1.2%, VSZ: 1219607636KB)
   - PID 3575: `/usr/bin/gnome-shell ` (Memory: 0.8%, VSZ: 4975620KB)
   - PID 120258: `/usr/share/windsurf/windsurf ` (Memory: 0.6%, VSZ: 1218133860KB)
   - PID 144907: `/snap/firefox/6782/usr/lib/firefox/firefox -contentproc -isForBrowser -prefsHandle 0:50837 -prefMapHandle 1:276483 -jsInitHandle 2:223368 -parentBuildID 20250911093530 -sandboxReporter 3 -chrootClient 4 -ipcHandle 5 -initialChannelId {0f9ef64f-1be7-4578-8635-f22cc4b2a7a4} -parentPid 144505 -crashReporter 6 -crashHelper 7 -greomni /snap/firefox/6782/usr/lib/firefox/omni.ja -appomni /snap/firefox/6782/usr/lib/firefox/browser/omni.ja -appDir /snap/firefox/6782/usr/lib/firefox/browser 5 tab ` (Memory: 0.6%, VSZ: 2569908KB)
   - PID 121845: `/usr/share/windsurf/windsurf /home/msr/.windsurf/extensions/visualstudioexptteam.intellicode-api-usage-examples-0.2.9/dist/server/server.js --node-ipc --clientProcessId=120875 ` (Memory: 0.4%, VSZ: 1216149568KB)
   - PID 120330: `/usr/share/windsurf/windsurf --type=gpu-process --crashpad-handler-pid=120312 --enable-crash-reporter=d1c060cf-23f6-4a81-bb0a-821760a082ae,no_channel --user-data-dir=/home/msr/.config/Windsurf --gpu-preferences=UAAAAAAAAAAgAAAEAAAAAAAAAAAAAAAAAABgAAEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQAAABAAAAAAAAAAEAAAAAAAAAAIAAAAAAAAAAgAAAAAAAAA --shared-files --field-trial-handle=3,i,6438376976639204673,9223008447080959175,262144 --enable-features=DocumentPolicyIncludeJSCallStacksInCrashReports --disable-features=CalculateNativeWinOcclusion,SpareRendererForSitePerProcess --variations-seed-version ` (Memory: 0.4%, VSZ: 34290224KB)
   - PID 150180: `/snap/firefox/6782/usr/lib/firefox/firefox -contentproc -isForBrowser -prefsHandle 0:46205 -prefMapHandle 1:276483 -jsInitHandle 2:223368 -parentBuildID 20250911093530 -sandboxReporter 3 -chrootClient 4 -ipcHandle 5 -initialChannelId {0725967a-daae-4678-a9cc-f0ba72da4bb2} -parentPid 144505 -crashReporter 6 -crashHelper 7 -greomni /snap/firefox/6782/usr/lib/firefox/omni.ja -appomni /snap/firefox/6782/usr/lib/firefox/browser/omni.ja -appDir /snap/firefox/6782/usr/lib/firefox/browser 15 tab ` (Memory: 0.4%, VSZ: 2444496KB)
   - PID 150246: `/snap/firefox/6782/usr/lib/firefox/firefox -contentproc -isForBrowser -prefsHandle 0:46205 -prefMapHandle 1:276483 -jsInitHandle 2:223368 -parentBuildID 20250911093530 -sandboxReporter 3 -chrootClient 4 -ipcHandle 5 -initialChannelId {f37eee36-5824-4bf8-9565-ef6f363a4eb8} -parentPid 144505 -crashReporter 6 -crashHelper 7 -greomni /snap/firefox/6782/usr/lib/firefox/omni.ja -appomni /snap/firefox/6782/usr/lib/firefox/browser/omni.ja -appDir /snap/firefox/6782/usr/lib/firefox/browser 16 tab ` (Memory: 0.4%, VSZ: 2444496KB)
   - PID 150310: `/snap/firefox/6782/usr/lib/firefox/firefox -contentproc -isForBrowser -prefsHandle 0:46205 -prefMapHandle 1:276483 -jsInitHandle 2:223368 -parentBuildID 20250911093530 -sandboxReporter 3 -chrootClient 4 -ipcHandle 5 -initialChannelId {50003e7f-3f41-449c-b817-7615324ce7ed} -parentPid 144505 -crashReporter 6 -crashHelper 7 -greomni /snap/firefox/6782/usr/lib/firefox/omni.ja -appomni /snap/firefox/6782/usr/lib/firefox/browser/omni.ja -appDir /snap/firefox/6782/usr/lib/firefox/browser 17 tab ` (Memory: 0.4%, VSZ: 2444496KB)
   - PID 144757: `/snap/firefox/6782/usr/lib/firefox/firefox -contentproc -isForBrowser -prefsHandle 0:40625 -prefMapHandle 1:276483 -jsInitHandle 2:223368 -parentBuildID 20250911093530 -sandboxReporter 3 -chrootClient 4 -ipcHandle 5 -initialChannelId {52309114-8fb8-4232-8a5b-0c54534bb8f8} -parentPid 144505 -crashReporter 6 -crashHelper 7 -greomni /snap/firefox/6782/usr/lib/firefox/omni.ja -appomni /snap/firefox/6782/usr/lib/firefox/browser/omni.ja -appDir /snap/firefox/6782/usr/lib/firefox/browser 3 tab ` (Memory: 0.3%, VSZ: 2494152KB)
   - PID 3595: `/usr/libexec/mutter-x11-frames ` (Memory: 0.3%, VSZ: 1405900KB)
   - PID 32020: `gjs /usr/share/gnome-shell/extensions/ding@rastersoft.com/app/ding.js -E -P /usr/share/gnome-shell/extensions/ding@rastersoft.com/app ` (Memory: 0.3%, VSZ: 3215340KB)

### 💡 General Recommendations






- 🔄 **Regular Maintenance:** Run this optimization script weekly
- 📊 **Monitor Performance:** Check this report regularly for trends
- 🗂️ **Clean Logs:** System logs should be cleaned every few days
- 🔄 **Restart Services:** Restart problematic services periodically

---

## 📈 Optimization History

**Last Optimization:** 2025-09-20 10:00:29  
**Script Version:** 3.0  
**Optimizations Performed:** 15 different optimization tasks  

### Tasks Completed:
- ✅ APT Cache Cleaning
- ✅ System Logs Cleaning  
- ✅ Browser Cache Cleaning
- ✅ Thumbnail Cache Cleaning
- ✅ Development Cache Cleaning
- ✅ Temporary Files Cleaning
- ✅ Swap Memory Clearing
- ✅ RAM Cache Clearing
- ✅ Snap Cache Cleaning
- ✅ Performance Optimization
- ✅ Package Manager Cleaning
- ✅ Zombie Process Removal
- ✅ Network Optimization
- ✅ Font Cache Cleaning
- ✅ Startup Optimization

---

**Report generated by Ubuntu System Optimizer & Cleaner v3.0**  
*For support and updates, check the script documentation.*
