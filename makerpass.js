Accounts.oauth.registerService('makerpass')

if (Meteor.isClient) {
  Meteor.loginWithMakerpass = function(options, callback) {
    // support a callback without options
    if (! callback && typeof options === "function") {
      callback = options
      options = null
    }

    var credentialRequestCompleteCallback = Accounts.oauth.credentialRequestCompleteHandler(callback)
    Makerpass.requestCredential(options, credentialRequestCompleteCallback)
  }
} else {
  Accounts.addAutopublishFields({
    // This sends access tokens to the browser
    forLoggedInUser: ['services.makerpass'],
    forOtherUsers: ['services.makerpass.name', 'services.makerpass.avatarUrl']
  })
}
