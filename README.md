# accounts-makerpass

A meteor package for [MakerSquare's](http://makersquare.com) MakerPass login system.

## Install

```
meteor add accounts-ui
meteor add makersquare:accounts-makerpass
```

## Usage

First you need to add login buttons into your html (this is from the built-in [accounts-ui](http://docs.meteor.com/#/full/accountsui) package):

```
<template name="MyPage">
  {{> loginButtons}}
</template>
```

After this you should see a red `Configure Makerpass Login` button on your page. Click this button and add your Client ID and Client Secret (if you don't have these, ask Gilbert to give you some).

After entering this info you should see a `Sign in with Makerpass` button.

## Handling New Users

When someone logs in with MakerPass, it gives you a lot of useful user information:

* `id` - The globally unique ID of the user
* `name` - The name of the user
* `avatarUrl` - A url of the user's avatar
* `email` - The email address of the user
* `memberships` - All the groups that the user is associated with (cohorts, staff, etc.), as well as the type of the user's membership of that group (`student`, `instructor`, etc.)

Here's how you can store the public data:

```javascript
if (Meteor.isServer) {

  // Accounts is built into Meteor
  // http://docs.meteor.com/#/basic/accounts_oncreateuser
  Accounts.onCreateUser(function(options, user) {

    // Here is the data this package gives you
    var mks = user.services.makerpass

    // OPTIONAL: Restrict this app to "official" members of MakerSquare
    if (mks.memberships.length === 0) {
      throw new Meteor.Error(401, "Sorry, you are not a member of any MakerPass groups.")
    }


    // WARNING: user.profile is writable by user.
    // Don't put something in user.profile if you don't want the user to change it.
    user.profile = options.profile || {}
    user.profile.name       = mks.name
    user.profile.avatarUrl  = mks.avatarUrl

    return user
  })
}
```

And here's an example of using `memberships`. Let's say you want to restrict users to sending messages only to other members of that user's groups. For instance, user X can send a message to user Y only because they are both a member a common group C.

Here's an untested code example:

```javascript
if (Meteor.isServer) {

  Meteor.methods({
    sendMessage: function (receiverId, content) {
      var sender   = Meteor.user()
      var receiver = Meteor.users.find(receiverId)
      if (! receiver) {
        throw new Meteor.Error("User does not exist.")
      }

      // Here's the interesting bit:
      var sharedGroupIds = intersect(getGroupIds(sender), getGroupIds(receiver))
      if (sharedGroupIds.length === 0) {
        throw new Meteor.Error("You have no common groups with this receiver.")
      }

      Messages.insert({
        senderId: sender._id,
        receiverId: receiverId,
        content: content
      })
    }
  })

  // Helpers, to make cleaner code
  function getGroupIds (user) {
    return user.services.makerpass.memberships.map(getProp('group.uid'))
  }

  function getProp (selector) {
    return function (obj) {
      var result = obj
      selector.split('.').forEach(function(prop){ result = result[prop] })
      return result
    }
  }

  function intersect (a, b) {
    var results = []
    // O(n * m), but it's k cause data set is small (~1-3 groups a user)
    return a.reduce(function(results, elem) {
      if (b.indexOf(elem) !== -1) { results.push(elem) }
      return results
    }, [])
  }
}
```

## Changing MakerPass Configuration

If you get something wrong in the configuration process (client id / secret), you can reset it by opening the mongo console and clearing the configuration manually:

```bash
$ meteor mongo
> db.meteor_accounts_loginServiceConfiguration.remove({ service: 'makerpass' })
```

Afterwards, the red `Configure Makerpass Login` button should pop up again.
