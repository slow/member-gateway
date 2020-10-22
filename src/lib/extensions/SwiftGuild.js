const { Structures } = require('discord.js');
const SwiftGuildMemberManager = require('./SwiftGuildMemberManager');

Structures.extend('Guild', (Guild) => {
   class SwiftGuild extends Guild {
      constructor(client, data) {
         const { members, ...restData } = data || {};
         super(client, Object.keys(restData).length ? restData : undefined);
         this.members = new SwiftGuildMemberManager(this);
         if (members) for (const member of members) this.members.add(member);
      }
   }

   return SwiftGuild;
});
