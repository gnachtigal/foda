game.audio = {
  defaultVolume: 0.25,
  defaultMusic: 0.5,
  build: function () {
    game.audio.context = new AudioContext();
    game.audio.volumeNode = game.audio.context.createGain();
    game.audio.volumeNode.connect(game.audio.context.destination);
    game.audio.soundsNode = game.audio.context.createGain();
    game.audio.soundsNode.connect(game.audio.volumeNode);
    game.audio.musicNode = game.audio.context.createGain();
    game.audio.musicNode.connect(game.audio.volumeNode);
    game.audio.volumeNode.gain.value = game.audio.defaultVolume;
    game.audio.loadMusic();
    game.audio.loadSounds();
  },
  buffers: {},
  load: function (name, cb) {
    var ajax = new XMLHttpRequest();
    ajax.open('GET', game.dynamicHost + 'audio/' + name + '.mp3', /*async*/true);
    ajax.responseType = 'arraybuffer';
    ajax.onload = function () {
      game.audio.context.decodeAudioData(ajax.response, function (buffer) {
        game.audio.buffers[name] = buffer;
        if (cb) { cb(); }
      });
    };
    ajax.send();
  },
  sounds: [
    'activate',
    'crit',
    'horn',
    'battle',
    'pick',
    'tower/attack',
    'tutorial/axehere',
    'tutorial/axebattle',
    'tutorial/axemove',
    'tutorial/axeattack',
    'tutorial/axetime',
    'tutorial/axewait',
    'tutorial/axeah',
    'am/attack',
    'am/burn',
    'am/blink',
    'am/ult',
    'cm/attack',
    'cm/freeze',
    'cm/slow',
    'cm/ult',
    'ld/attack',
    'ld/bear',
    'ld/cry',
    'ld/entangle',
    'ld/rabid',
    'ld/return',
    'ld/transform',
    'ld/ult',
    'pud/attack',
    'pud/hook',
    'pud/rot',
    'pud/ult',
    'pud/ult-channel',
    'wk/attack',
    'wk/stun',
    'wk/ult',
    'crit'
  ],
  loadSounds: function () {
    $(game.audio.sounds).each(function (a, b) {
      game.audio.load(b);
    });
  },
  loadMusic: function () {
    game.audio.song = 'SneakyAdventure';
    game.audio.load(game.audio.song, function () {
      game.audio.play(game.audio.song);
      setInterval(function () {
        game.audio.play(game.audio.song);
      }, game.audio.buffers[game.audio.song].duration * 1000);
    });
  },
  play: function (name) {
    if (game.audio.context && 
        game.audio.context.createBufferSource &&
        game.audio.buffers[name] &&
        game.audio.buffers[name].duration) {
      var audio = game.audio.context.createBufferSource();
      //console.log(name, game.audio.buffers[name]);
      audio.buffer = game.audio.buffers[name];
      if (name === game.audio.song) {
        audio.connect(game.audio.musicNode);
      } else {
        audio.connect(game.audio.soundsNode);
      }
      audio.start();
    }
  },
  mute: function () {
    var vol = game.audio.unmutedvolume || game.audio.volumeNode.gain.value || game.audio.defaultVolume;
    if (this.checked) { vol = 0; }
    game.audio.setVolume('volume', vol);
  },
  setVolume: function (target , v) {
    if (v === undefined || v === null) {
      v = game.audio.defaultVolume;
      if (target == 'music') v = game.audio.defaultMusic;
    }
    var vol = parseFloat(v);
    if (vol <= 0) {
      vol = 0;
      if (target === 'volume') game.options.muteinput.prop('checked', true);
    } else {
      if (target === 'volume') {
        game.audio.unmutedvolume = vol;
        game.options.muteinput.prop('checked', false);
      }
    }
    if (vol > 1) { vol = 1; }
    if (game.audio[target + 'Node']) {
      game.audio[target + 'Node'].gain.value = vol;
      game.options[target + 'control'].css('transform', 'scale(' + vol + ')');
      localStorage.setItem(target, vol);
    }
  },
  rememberVolume: function () {
    var volume = localStorage.getItem('volume') || game.audio.defaultVolume;
    game.audio.setVolume('volume', volume);
    var music = localStorage.getItem('music') || game.audio.defaultMusic;
    game.audio.setVolume('music', music);
    var sounds = localStorage.getItem('sounds') || game.audio.defaultVolume;
    game.audio.setVolume('sounds', sounds);
  },
  volumeMouseDown: function (event) {
    var target = $(event.target).closest('.volume').attr('id');
    game.audio.volumetarget = target;
    game.audio.volumeMouseMove(event);
    game.options[target + 'input'].on('mousemove.volume', game.audio.volumeMouseMove);
  },
  volumeMouseUp: function () {
    if (game.audio.volumetarget) {
      game.options[game.audio.volumetarget + 'input'].off('mousemove.volume');
      game.audio.volumetarget = false;
    }
  },
  volumeMouseMove: function (event) {
    var w = 100 * game.screen.scale;
    //console.log(w);
    var x = event.clientX - game.options.volumecontrol.offset().left,
        v = parseInt(x / game.screen.scale, 10) / 100;
    //console.log(x, v)
    game.audio.setVolume(game.audio.volumetarget, v);
  },
  volumeControl: function (name) {
    game.options[name+'control'] = $('<div>').addClass('volumecontrol');
    game.options[name+'input'] = $('<div>').addClass('volume').attr('id', name).append(game.options[name+'control']);
    $('<label>').appendTo(game.options.audio).append($('<span>').text(game.data.ui[name])).append(game.options[name+'input']);
  }
};
