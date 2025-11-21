// ==UserScript==
// @id             iitc-plugin-portalcode-YokohamaBB
// @name           IITC Plugin: Portal Code Viewer (Yokohama + search)
// @category       Layer
// @version        0.2.1.202511211500
// @namespace      iitc-plugin-portalcode-YokohamaBB
// @description    横浜BB用ポータルコード。標準検索ボックスからコード検索可能。
// @include        https://*.ingress.com/*
// @include        http://*.ingress.com/*
// @match          https://*.ingress.com/*
// @match          http://*.ingress.com/*
// @grant          none
// ==/UserScript==

(function () {
  "use strict";

  const wrapper = function (plugin_info) {
    if (typeof window.plugin !== "function") {
      window.plugin = function () {};
    }

    if (typeof window.plugin.portalCodeSimple === "undefined") {
      window.plugin.portalCodeSimple = {};
    }
    const self = window.plugin.portalCodeSimple;

    /** @type {L.FeatureGroup|null} */
    self.layerABC = null;
    /** @type {L.FeatureGroup|null} */
    self.layerX = null;

    /** @type {Map<string, {lat:number,lng:number,type:string,code:string}>} */
    self.portalDataMap = new Map();
    /** @type {L.CircleMarker|null} */
    self.searchMarker = null;

    // ★ 内郭ポータルコード
    const BLUE_CODES = new Set([
      "a27","a28","a29","a30","a31","a32","a33",
      "b27","b28","b29","b30","b31","b32","b33","b34",
    ]);

    // ====== ポータルコードリスト（lat,lng版） ======
    // [lat, lng, "code"]
    const PORTAL_DATA = [
      [35.447078, 139.637661, "A01"],
      [35.446902, 139.637476, "A02"],
      [35.447243, 139.637107, "A03"],
      [35.447334, 139.636868, "A04"],
      [35.44703, 139.636609, "A05"],
      [35.446951, 139.63655, "A06"],
      [35.446641, 139.636801, "A07"],
      [35.4463, 139.636512, "A08"],
      [35.446021, 139.636828, "A09"],
      [35.445649, 139.637313, "A10"],
      [35.445539, 139.63777, "A11"],
      [35.445186, 139.63838, "A12"],
      [35.445313, 139.63847, "A13"],
      [35.445197, 139.638705, "A14"],
      [35.44509, 139.638955, "A15"],
      [35.445282, 139.639078, "A16"],
      [35.445388, 139.639894, "A17"],
      [35.445774, 139.639688, "A18"],
      [35.445759, 139.640193, "A19"],
      [35.446153, 139.640408, "A20"],
      [35.446586, 139.640764, "A21"],
      [35.446741, 139.640191, "A22"],
      [35.446658, 139.639565, "A23"],
      [35.446681, 139.639143, "A24"],
      [35.446947, 139.638963, "A25"],
      [35.447251, 139.638393, "A26"],
      [35.44657, 139.638441, "A27"],
      [35.446335, 139.637279, "A28"],
      [35.445751, 139.637727, "A29"],
      [35.44615, 139.6381, "A30"],
      [35.445804, 139.638153, "A31"],
      [35.445949, 139.638995, "A32"],
      [35.446156, 139.639008, "A33"],

      [35.450751, 139.638268, "B01"],
      [35.450567, 139.638143, "B02"],
      [35.450081, 139.637753, "B03"],
      [35.449727, 139.637485, "B04"],
      [35.449569, 139.637667, "B05"],
      [35.449167, 139.638545, "B06"],
      [35.448912, 139.638989, "B07"],
      [35.448788, 139.639655, "B08"],
      [35.44817, 139.640706, "B09"],
      [35.447728, 139.641232, "B10"],
      [35.447745, 139.641725, "B11"],
      [35.447997, 139.641672, "B12"],
      [35.448328, 139.641832, "B13"],
      [35.448496, 139.64234, "B14"],
      [35.448644, 139.642171, "B15"],
      [35.448911, 139.64225, "B16"],
      [35.449008, 139.642033, "B17"],
      [35.449007, 139.641783, "B18"],
      [35.449315, 139.641412, "B19"],
      [35.449484, 139.641027, "B20"],
      [35.449541, 139.640667, "B21"],
      [35.449527, 139.640367, "B22"],
      [35.449884, 139.639597, "B23"],
      [35.450223, 139.639302, "B24"],
      [35.450298, 139.638762, "B25"],
      [35.450509, 139.63859, "B26"],
      [35.449934, 139.638683, "B27"],
      [35.449557, 139.638584, "B28"],
      [35.448933, 139.639823, "B29"],
      [35.448808, 139.639985, "B30"],
      [35.448625, 139.640437, "B31"],
      [35.44949, 139.640006, "B32"],
      [35.449535, 139.639593, "B33"],
      [35.449835, 139.639009, "B34"],

      [35.448699, 139.643157, "C01"],
      [35.448229, 139.643492, "C02"],
      [35.448146, 139.643827, "C03"],
      [35.448056, 139.644022, "C04"],
      [35.448012, 139.643783, "C05"],
      [35.447799, 139.644272, "C06"],
      [35.448532, 139.644751, "C07"],
      [35.448352, 139.644388, "C08"],
      [35.448841, 139.643988, "C09"],
      [35.448693, 139.643832, "C10"],
      [35.448414, 139.642539, "C11"],
      [35.44826, 139.642763, "C12"],
      [35.448218, 139.643001, "C13"],
      [35.447932, 139.643372, "C14"],
      [35.447606, 139.642855, "C15"],
      [35.447226, 139.642917, "C16"],
      [35.447073, 139.642583, "C17"],
      [35.447314, 139.6421, "C18"],
      [35.447824, 139.643602, "C19"],
      [35.447558, 139.643619, "C20"],
      [35.447319, 139.643264, "C21"],
      [35.447115, 139.643102, "C22"],
      [35.44682, 139.642923, "C23"],
      [35.446489, 139.643905, "C24"],
      [35.4469, 139.643993, "C25"],
      [35.44708, 139.644055, "C26"],
      [35.447337, 139.643895, "C27"],
      [35.447434, 139.644263, "C28"],
      [35.447436, 139.644388, "C29"],
      [35.447432, 139.644471, "C30"],
      [35.44754, 139.643927, "C31"],
      [35.447629, 139.643865, "C32"],
      [35.447734, 139.643899, "C33"],

      [35.447257, 139.636446, "X01"],
      [35.450731, 139.637714, "X02"],
      [35.450465, 139.637633, "X03"],
    ];

    self.addPortalMarker = function (lat, lng, code, className, layerGroup) {
      const marker = L.marker([lat, lng], {
        icon: L.divIcon({
          className: "portal-code-marker " + className,
          html: code,
          iconSize: [80, 12],
          iconAnchor: [40, 6],
        }),
        interactive: false,
      });
      marker.addTo(layerGroup);
    };

    self.plotPortals = function () {
      self.portalDataMap.clear();

      let countABC = 0;
      let countX = 0;

      PORTAL_DATA.forEach((data) => {
        try {
          const [lat, lng, code] = data;
          if (typeof lat !== "number" || typeof lng !== "number" || typeof code !== "string") return;

          const key = code.toLowerCase();
          const first = key.charAt(0);

          let className;
          let layerGroup;
          let type;

          if (first === "x") {
            className = "portal-code-gray";
            layerGroup = self.layerX;
            type = "X";
            countX++;
          } else if (first === "a" || first === "b" || first === "c") {
            // ★ 指定コードかどうか
            if (BLUE_CODES.has(key)) {
              className = "portal-code-orange"; // 青系
            } else {
              className = "portal-code-red";    // 緑系
            }
            layerGroup = self.layerABC;
            type = "ABC";
            countABC++;
          } else {
            return; // 対象外
          }

          if (!layerGroup) return;

          self.addPortalMarker(lat, lng, code, className, layerGroup);

          // 検索用
          self.portalDataMap.set(key, {
            lat,
            lng,
            type,
            code,
          });
        } catch (e) {
          console.warn("[portalCodeSimple] Failed to process data:", data, e);
        }
      });

      console.log(
        `[portalCodeSimple] Plotting complete. ABC: ${countABC}, X: ${countX}`,
      );
    };

    /**
     * 検索ハイライトを消去
     */
    self.clearSearchHighlight = function () {
      if (self.searchMarker) {
        window.map.removeLayer(self.searchMarker);
        self.searchMarker = null;
      }
    };

    /**
     * IITC標準検索ボックスのハンドラ
     */
    self.handleSearch = function (query) {
      const term = query.term.trim().toLowerCase();
      if (!term) return;

      const info = self.portalDataMap.get(term);
      if (!info) return;

      const latlng = [info.lat, info.lng];

      query.addResult({
        title: info.code,
        description: `[Portal Code: ${info.type}]`,
        latlng: latlng,
        icon: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAA0AAAANCAYAAABy6+R8AAAABGdBTUEAALGPC/xhBQAAACBjSFJNAAB6JgAAgIQAAPoAAACA6AAAdTAAAOpgAAA6mAAAF3CculE8AAAAaUlEQVQoz2NgoBj8B6I2E4g3A7EPEG8G4j4gHoPEgRCg3A/EzUD8DMSfAfFykEAmA2I7EP8H4lQgHozhAkA2ExAZC1kYIJUDsS4Qz0IiNGBWA+IzIP4PxKdA/BgQzwRiEBiAAAEGAJMbBgZ308iLAAAAAElFTkSuQmCC",
        onSelected: function (result, event) {
          self.clearSearchHighlight();

          window.map.setView(result.latlng, 17);

          self.searchMarker = L.circleMarker(result.latlng, {
            radius: 20,
            color: "#FFFF00",
            weight: 3,
            opacity: 0.8,
            fillOpacity: 0.3,
          }).addTo(window.map);
        },
      });
    };

    /**
     * プラグイン起動
     */
    self.start = function () {
      self.layerABC = new L.FeatureGroup();
      self.layerX = new L.FeatureGroup();

      // CSS
      const cssData = `
.portal-code-marker {
  font-size: 11px;
  font-weight: bold;
  text-shadow: 0 0 3px #000, 0 0 3px #000, 0 0 3px #000;
  white-space: nowrap;
  pointer-events: none;
  text-align: center;
}
/* 通常ABC（緑） */
.portal-code-red {
  color: #00ff7f;
}
/* 特定コード用 */
.portal-code-orange {
  color: #87cefa;
}
/* Xコード（灰） */
.portal-code-gray {
  color: #AAAAAA;
}
      `;
      const styleTag = document.createElement("style");
      styleTag.setAttribute("type", "text/css");
      styleTag.innerHTML = cssData;
      document.getElementsByTagName("head")[0].appendChild(styleTag);

      // ポータル描画（非同期で開始）
      setTimeout(self.plotPortals, 0);

      // 検索フック
      window.addHook("search", self.handleSearch);
      // マップクリックでハイライト消去
      window.map.on("click", self.clearSearchHighlight);

      // レイヤー登録（デフォルトON）
      window.addLayerGroup("Portal Codes ABC (green/blue text)", self.layerABC, true);
      window.addLayerGroup("Portal Codes X (gray text)", self.layerX, true);
    };

    const setup = self.start;
    setup.info = plugin_info;

    if (!window.bootPlugins) window.bootPlugins = [];
    window.bootPlugins.push(setup);
    if (window.iitcLoaded && typeof setup === "function") {
      setup();
    }
  };

  const script = document.createElement("script");
  const info = {};
  if (typeof GM_info !== "undefined" && GM_info && GM_info.script) {
    info.script = {
      version: GM_info.script.version,
      name: GM_info.script.name,
      description: GM_info.script.description,
    };
  }
  script.appendChild(
    document.createTextNode("(" + wrapper + ")(" + JSON.stringify(info) + ");"),
  );
  (document.body || document.head || document.documentElement).appendChild(
    script,
  );
})();

