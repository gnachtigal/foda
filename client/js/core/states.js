game.states = {
  el: $('.states').first(),
  valid: ['loading', 'log', 'menu', 'campaign', 'choose', 'result', 'table', 'vs'],
  build: function (cb) { 
    for (var i=0; i<game.states.valid.length; i++) {
      game.states.buildState(game.states.valid[i]);
    }
    if (cb) cb();
  },
  buildState: function (name) {
    var state = game.states[name];
    if (state && !state.builded) {
      state.builded = true;
      state.el = $('<div>').addClass('state ' + name).hide();
      if (state.build) state.build();
      state.el.appendTo(game.states.el);
    }
  },
  validState: function (state) {
    return (
      state && 
      game.states[state] && game.states.valid.indexOf(state) >= 0 &&
      state !== game.currentState
    );
  },
  changeTo: function (state, recover) {
    if (game.states.validState(state)) {
      $(game.states.valid).each(function () {
        game.container.removeClass(this+'-state');
      });
      game.container.addClass(state+'-state');
      var oldstate = game.states[game.currentState];
      if (oldstate) {
        if (oldstate.end) oldstate.end();
        if (oldstate.el) oldstate.el.hide();
      }    
      game.timeout(200, function (state, recover) {
        game.clearTimeouts();
        game.states.buildState(state);
        var newstate, old = game.currentState;
        newstate = game.states[state];
        if (newstate.el) {
          localStorage.setItem('state', state);
          newstate.el.fadeIn();
        }
        game.currentState = state;
        if (old != 'loading' && old != 'noscript') {
          localStorage.setItem('backstate', old);
          game.backState = old;
        }
        if (newstate.start) newstate.start(recover);
        
      }.bind(this, state, recover));
    }
  },
  back: function () {
    if (!game.backState) game.backState = localStorage.getItem('backstate');
    game.states.changeTo(game.backState);
  }
};
