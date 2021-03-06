game.skills.pud = {
  hook: {
    cast: function (skill, source, target) {
      var range = skill.data('aoe range'),
          hooked = source.firstCardInLine(target, range);
      if (hooked && hooked.hasClasses('heroes units') && !hooked.hasClasses('ghost towers')) {
        if (hooked.side() == source.opponent()) {
          source.damage(skill.data('damage'), hooked, skill.data('damage type'));
          hooked.stopChanneling();
        }
        if (target.getPosition() != hooked.getPosition()) hooked.move(target);
      }
    }
  },
  rot: {
    toggle: function (skill, source) {
      if (skill.hasClass('on')) { //turn off
        skill.removeClass('on');
        source.off('turnend.rot');
        source.data('pud-rot', null);
        source.removeClass('pud-rot');
        source.removeBuff('pud-rot');
        $('.pud-rot-target').removeClass('pud-rot-target');
        $('.map .card.'+source.opponent()).removeBuff('pud-rot');
      } else { //turn on
        skill.addClass('on');
        source.on('turnend.rot', game.skills.pud.rot.turnend);
        source.data('pud-rot', skill);
        source.addClass('pud-rot');
        source.selfBuff(skill, 'rot-source');
        var range = skill.data('aoe range');
        var curse = game.skills.pud.rot.curse.bind({source: source, skill: skill});
        source.opponentsInRange(range, curse);
        source.on('moved.rot', function () { source.opponentsInRange(range, curse); });
      }
    },
    curse: function (target) {
      var source = this.source,
          skill = this.skill;
      target.addClass('pud-rot-target');
      source.addBuff(target, skill, 'rot-targets');
    },
    turnend: function (event, eventdata) {
      var source = eventdata.target;
      var skill = source.data('pud-rot');
      var range = skill.data('aoe range');
      var damage = skill.data('damage');
      source.damage(damage, source, skill.data('damage type'));
      var curse = game.skills.pud.rot.curse.bind({source: source, skill: skill});
      source.opponentsInRange(range, curse);
      $('.pud-rot-target').each(function (i, card) {
        target = $(card);
        source.damage(damage, target, skill.data('damage type'));
        target.removeClass('pud-rot-target');
    });
    }
  },
  passive: {
    passive: function (skill, source) {
      var buff = source.selfBuff(skill);
      source.on('kill', this.kill);
      var kills = source.data('kills');
      game.skills.pud.passive.bonus(buff, source, kills);
    },
    bonus: function (buff, source, kills) {
      var damage = source.data('current damage');
      var bonusDamage = buff.data('damage per kill') * kills;
      source.setDamage(damage + bonusDamage);
      var hp = source.data('hp');
      var bonusHp = buff.data('hp per kill') * kills;
      source.setHp(hp + bonusHp);
      hp = source.data('current hp');
      source.setCurrentHp(hp + bonusHp);
    },
    kill: function (event, eventdata) {
      var source = eventdata.source;
      var target = eventdata.target;
      var buff = source.getBuff('pud-passive');
      if (source.side() == target.opponent() && target.hasClass('heroes')) game.skills.pud.passive.bonus(buff, source, 1);
    }
  },
  ult: {
    cast: function (skill, source, target) {
      source.selfBuff(skill, 'ult-source');
      source.addBuff(target, skill, 'ult-target');
      source.addClass('pud-ult');
      target.addClass('disabled');
      target.data('pud-ult-source', source);
      target.on('death.pud-ult', this.death);
      game.skills.pud.ult.bite(source, target, skill);
      source.on('channel', this.channel);
      source.on('channelend', this.channelend);
    },
    channel: function (event, eventdata) {
      var source = eventdata.source;
      var target = eventdata.target;
      var skill = eventdata.skill;
      if ( source.data('channeling') === 0) game.skills.pud.ult.bite(source, target, skill);
    },
    bite: function (source, target, skill) {
      game.audio.play('pud/ult-channel');
      target.shake();
      target.stopChanneling();
      source.damage(skill.data('dot'), target, skill.data('damage type'));
      source.heal(skill.data('dot'));
    },
    death: function (event, eventdata) {
      var target = eventdata.target;
      var source = target.data('pud-ult-source');
      source.stopChanneling();
    },
    channelend: function (event, eventData) {
      var source = eventData.source;
      var target = eventData.target;
      target.removeClass('disabled');
      target.data('pud-ult-source', null);
      target.off('death.pud-ult');
      target.removeBuff('pud-ult');
      source.removeBuff('pud-ult');
      source.removeClass('pud-ult');
    }
  }
};
