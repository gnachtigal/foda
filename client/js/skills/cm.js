game.skills.cm = {
  slow: {
    cast: function (skill, source, target) {
      var opponent = source.opponent();
      var range = skill.data('aoe range');
      target.inRange(range, function (spot) {
        var card = spot.find('.card');
        if (card.hasClass(opponent)) {
          source.damage(skill.data('damage'), card, skill.data('damage type'));
          source.addBuff(card, skill);
        }
      });
    }
  },
  aura: {
    passive: function (skill, source) {
      var side = source.side();
      game[side].cardsPerTurn += 1;
      source.on('death.cm-aura');
      source.on('reborn.cm-aura');
      source.selfBuff(skill);
    },
    death: function (event, eventdata) {
      var cm = eventdata.target;
      var side = cm.side();
      game[side].cardsPerTurn -= 1;
    },
    reborn: function (event, eventdata) {
      var cm = eventdata.target;
      var side = cm.side();
      game[side].cardsPerTurn += 1;
    }
  },
  freeze: {
    cast: function (skill, source, target) {
      target.addClass('rooted disarmed');
      target.stopChanneling();
      var buff = source.addBuff(target, skill);
      source.damage(buff.data('dot'), target, buff.data('damage type'));
      buff.on('buffcount', this.buffcount);
      buff.on('expire', this.expire);
    },
    buffcount: function (event, eventdata) {
      var target = eventdata.target;
      var buff = eventdata.buff;
      var source = buff.data('source');
      if (buff.data('duration') !== 2) 
        source.damage(buff.data('dot'), target, buff.data('damage type'));
    },
    expire: function (event, eventdata) {
      var target = eventdata.target;
      target.removeClass('rooted disarmed');
    }
  },
  ult: {
    cast: function (skill, source) {
      source.addClass('cm-ult');
      source.selfBuff(skill, 'ult-source');
      game.skills.cm.ult.damage(0, {source:source,skill:skill});
      source.on('channel', this.channel);
      source.on('channelend', this.channelend);
    },
    channel: function (event, eventdata) {
      if ( eventdata.source.data('channeling') === 0) 
        game.skills.cm.ult.damage(event, eventdata);
    },
    damage: function (event, eventdata) {
      game.shake();
      var cm = eventdata.source;
      var skill = eventdata.skill;
      var range = skill.data('aoe range');
      cm.opponentsInRange(range, function (target) {
        cm.damage(skill.data('damage'), target, skill.data('damage type'));
        cm.addBuff(target, skill, 'ult-targets');
      });
    },
    channelend: function (event, eventdata) {
      var cm = eventdata.source;
      cm.data('cm-ult', null);
      cm.removeClass('cm-ult');
      cm.removeBuff('cm-ult');
    }
  }
};
