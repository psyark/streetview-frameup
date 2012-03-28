
var StreetviewFrameup = function (renderer, scene) {
  this.renderer = renderer;
  this.scene = scene;
  this.camera = new THREE.PerspectiveCamera(90, 4 / 3, 1, 10000);
  this.scene.add(this.camera);
};

StreetviewFrameup.prototype.bind = function (panorama) {
  var self = this;
  this.panorama = panorama;
  var dfd = $.Deferred();
  var iid = setInterval(function () {
    var target = $(panorama.getContainer()).children('div:last').children('div').children('div:first');
    if (target.length) {
      setTimeout(function () {
        target.append($(self.renderer.domElement).css({ position:'absolute', left:0, top:0, 'z-index':2 }));
        dfd.resolve();
      }, 10);
      clearInterval(iid);
    }
  }, 100);
  google.maps.event.addListener(panorama, 'pov_changed', $.proxy(this.redraw, this));
  return dfd.promise();
};

StreetviewFrameup.prototype.redraw = function () {
  var e = $(this.panorama.getContainer());
  var width = e.width(), height = e.height();
  
  var pov = this.panorama.getPov();
  var fov = Math.atan(Math.PI * Math.pow(0.5, pov.zoom + 1))
            * Math.pow(height / width * 4 / 3, 0.5) * 2;
  
  this.camera.aspect = width / height;
  this.camera.fov = fov / Math.PI * 180;
  this.camera.rotation.y = -pov.heading / 180 * Math.PI;
  this.camera.rotation.x = pov.pitch / 180 * Math.PI;
  this.camera.updateProjectionMatrix();
  
  this.renderer.setSize(width, height);
  this.renderer.render(this.scene, this.camera);
};
