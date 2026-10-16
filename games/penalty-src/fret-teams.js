/* Fret Footy Cup: one club per group, with that club's crest beside the name. */
(function () {
  var TEAMS = [
    { name: "DUKES FC", logo: "logos/dukes.jpg" },
    { name: "RICO FOOTY", logo: "logos/rico.jpg" },
    { name: "TEAM SINS", logo: "logos/sins.jpg" },
    { name: "SHOWTIME", logo: "logos/showtime.png" }
  ];
  var LAYOUT_W = 800;
  var LAYOUT_H = 450;

  var root = document.getElementById("c2canvasdiv");
  if (!root) return;
  root.style.position = "relative";

  var box = document.createElement("div");
  box.id = "ff-logos";
  box.style.cssText = "position:absolute;inset:0;pointer-events:none;z-index:5;";
  root.appendChild(box);

  var imgs = TEAMS.map(function (team) {
    var img = document.createElement("img");
    img.alt = team.name;
    img.src = team.logo;
    img.style.cssText = "position:absolute;object-fit:cover;border-radius:50%;display:none;background:#111;box-shadow:0 0 0 2px rgba(0,0,0,.8);";
    box.appendChild(img);
    return img;
  });

  function onScreen(inst) {
    return inst && inst.x > -20 && inst.y > 80 && inst.y < 220 && inst.x < LAYOUT_W && inst.visible !== false && inst.opacity !== 0;
  }

  function tick() {
    requestAnimationFrame(tick);
    var rt = window.cr_getC2Runtime && window.cr_getC2Runtime();
    var canvas = document.getElementById("c2canvas");
    if (!rt || !canvas || !rt.types || !rt.types.t85) return;

    var buttons = (rt.types.t85.u || []).filter(onScreen).sort(function (a, b) { return a.x - b.x; });
    var labels = (rt.types.t71 && rt.types.t71.u || []).filter(onScreen).sort(function (a, b) { return a.x - b.x; });
    var show = buttons.length >= TEAMS.length && labels.length >= TEAMS.length;

    var rows = rt.types.t105 && rt.types.t105.u || [];
    for (var r = 0; r < rows.length; r++) {
      if (rows[r].y > 200) rows[r].opacity = show ? 0 : rows[r].opacity;
    }

    if (show) {
      var draw = rt.types.t10 && rt.types.t10.u && rt.types.t10.u[0];
      var canvasRect = canvas.getBoundingClientRect();
      var rootRect = root.getBoundingClientRect();
      var scaleX = canvasRect.width / LAYOUT_W;
      var scaleY = canvasRect.height / LAYOUT_H;
      var originX = canvasRect.left - rootRect.left;
      var originY = canvasRect.top - rootRect.top;
      var size = Math.round(34 * scaleY);

      for (var i = 0; i < TEAMS.length; i++) {
        var button = buttons[i];
        var label = labels[i];
        if (button.Zb && button.Zb.length) button.Zb[0] = i;
        if (draw && draw.Xc && draw.Xc[i] && draw.Xc[i][0]) draw.Xc[i][0][0] = i;
        if (label.text !== TEAMS[i].name) {
          label.text = TEAMS[i].name;
          label.Mc = true;
          if (label.j) label.j.aa = true;
        }
        var img = imgs[i];
        img.style.display = "block";
        img.style.width = size + "px";
        img.style.height = size + "px";
        img.style.left = (originX + (button.x + button.width - 10) * scaleX - size) + "px";
        img.style.top = (originY + (button.y + button.height / 2) * scaleY - size / 2) + "px";
      }
    }

    for (var n = 0; n < imgs.length; n++) {
      if (!show) imgs[n].style.display = "none";
    }
  }

  requestAnimationFrame(tick);
})();
