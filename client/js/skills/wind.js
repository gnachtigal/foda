game.skills.wind = {
  stun: {
    cast: function (skill, source, target) {
      var secTarget = source.behindTarget(target);
      if (secTarget) {
        if (secTarget.side() == source.opponent()) {
          source.addStun(target, skill);
          source.addStun(secTarget, skill);
        } else if (secTarget.hasClass('trees')) {
          source.addStun(target, skill);
        }
      } else {
        var stunNerf = -skill.data('stun')/2;
        source.addStun(target, skill, stunNerf);
      }
    }
  },
  arrow: {
    cast: function (skill, source, target) {
      var range = skill.data('aoe range');
      var width = skill.data('aoe width');
      var targets = [];
      source.inLine(target, range, width, function (spot) {
        var card = spot.children('.card');
        if (card.side() == source.opponent()) {
          targets.push(card);
        } else if (card.hasClass('trees')) {
          game.tree.destroy(card);
        }
      });
      var damage = skill.data('damage');
      var damageNerf = skill.data('damage reduction');
      var finalDmg = damage - (damageNerf * (targets.length - 1));
      $(targets).each(function () {
        source.damage(finalDmg, this, skill.data('damage type'));
      });
    }
  },
  run: {
    cast: function (skill, source) {
      source.selfBuff(skill);
      source.on('attacked.kotl-blind', this.attacked).select();
    },
    attacked: function (event, eventdata) {
      var source = eventdata.source;
      source.data('miss-attack', true);
    }
  },
  ult: {
    cast: function (skill, source, target) {
      var damage = source.data('current damage');
      var nerf = skill.data('damage reduction');
      source.setDamage(damage - nerf).addClass('nohighlight');
      for (var i=0; i < skill.data('attacks'); i++) {
        game.timeout(900 * i, source.attack.bind(source, target, 'force'));
      }
      game.timeout(3600, function (source, damage) {
        source.removeClass('nohighlight').setDamage(damage);
      }.bind(this, source, damage));
    }
  }
};
