const {
   GatewayStorage,
   Settings,
   util: { getIdentifier }
} = require('swift');
const { Collection } = require('discord.js');

class MemberGateway extends GatewayStorage {
   constructor(store, type, schema, provider) {
      super(store.client, type, schema, provider);

      this.store = store;

      this.syncQueue = new Collection();

      Object.defineProperty(this, '_synced', { value: false, writable: true });
   }

   get Settings() {
      return Settings;
   }

   get idLength() {
      return 37;
   }

   get(id) {
      const [guildID, memberID] = typeof id === 'string' ? id.split('.') : id;

      const guild = this.client.guilds.cache.get(guildID);
      if (guild) {
         const member = guild.members.cache.get(memberID);
         return member && member.settings;
      }

      return undefined;
   }

   create(id, data = {}) {
      const [guildID, memberID] = typeof id === 'string' ? id.split('.') : id;
      const entry = this.get([guildID, memberID]);
      if (entry) return entry;

      const settings = new this.Settings(this, { id: `${guildID}.${memberID}`, ...data });
      if (this._synced) settings.sync();
      return settings;
   }

   async sync(input = this.client.guilds.cache.reduce((keys, guild) => keys.concat(guild.members.cache.map((member) => member.settings.id)), [])) {
      if (Array.isArray(input)) {
         if (!this._synced) this._synced = true;
         const entries = await this.provider.getAll(this.type, input);
         for (const entry of entries) {
            if (!entry) continue;

            const cache = this.get(entry.id);
            if (!cache) continue;

            cache._existsInDB = true;
            cache._patch(entry);
         }

         for (const guild of this.client.guilds.cache.values()) {
            for (const member of guild.members.cache.values()) if (member.settings._existsInDB !== true) member.settings._existsInDB = false;
         }
         return this;
      }

      const target = getIdentifier(input);
      if (!target) throw new TypeError('The selected target could not be resolved to a string.');

      const cache = this.get(target);
      return cache ? cache.sync() : null;
   }
}

module.exports = MemberGateway;
