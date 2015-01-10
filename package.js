Package.describe({
  name: 'makersquare:accounts-makerpass',
  summary: "Login service for MakerPass accounts",
  version: '1.0.0',
  git: 'https://github.com/makersquare/meteor-accounts-makerpass'
});

Package.onUse(function(api) {
  api.versionsFrom('1.0.2.1');
  api.use('accounts-base', ['client', 'server']);

  // Export Accounts (etc) to packages using this one.
  api.imply('accounts-base', ['client', 'server']);
  api.use('accounts-oauth', ['client', 'server']);
  api.use('makersquare:makerpass@1.0.0', ['client', 'server']);

  api.addFiles("makerpass.js");
});
