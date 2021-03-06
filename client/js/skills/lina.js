game.skills.lina = {
  fire: {
    cast: function (skill, source, target) {
      var range = skill.data('aoe range');
      var width = skill.data('aoe width');
      var damage = skill.data('damage');
      source.opponentsInLine(target, range, width, function (card) {
        source.damage(damage, card, skill.data('damage type'));
      });
    }
  },
  stun: {
    cast: function (skill, source, target) {
      var range = skill.data('aoe range');
      var opponent = source.opponent();
      target.cardsInRange(range, function (card) {
        if (card.hasClass(opponent)) {
          source.damage(skill.data('damage'), card, skill.data('damage type'));
          source.addStun(card, skill);
        }
        if (card.hasClass('trees')) {
          game.tree.destroy(card);
        }
      });
    }
  },
  passive: {
    passive: function (skill, source) {
      source.addBuff(source, skill);
      source.on('cast', game.skills.lina.passive.cast);
    },
    cast: function (event, eventdata) {
      var source = eventdata.source;
      var buff = source.getBuff('lina-passive');
      var bonus = buff.data('cast damage bonus') || 0;
      source.setDamage(source.data('current damage') + bonus);
      source.on('turnend.passive', game.skills.lina.passive.turnend);
    },
    turnend: function () {
      var source = $(this);
      var buff = source.getBuff('lina-passive');
      var bonus = buff.data('cast damage bonus') || 0;
      source.setDamage(source.data('current damage') - bonus);
      source.off('turnend.passive');
    }
  },
  ult: {
    cast: function (skill, source, target) {
      source.damage(skill.data('damage'), target, skill.data('damage type'));
    }
  }
};
