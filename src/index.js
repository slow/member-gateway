const {
   Client: { plugin }
} = require('swift');

module.exports = {
   SwiftGuild: require('./lib/extensions/SwiftGuild'),
   SwiftGuildMemberManager: require('./lib/extensions/SwiftGuildMemberManager'),
   SwiftMember: require('./lib/extensions/SwiftMember'),
   MemberGateway: require('./lib/settings/MemberGateway'),
   Client: require('./lib/Client'),
   [plugin]: require('./lib/Client')[plugin]
};
