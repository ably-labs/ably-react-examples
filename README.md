# FAQs

## I want to add Ably to my react app but I'm not sure where to put the channel subscriptions?

There are multiple places you could handle your ably channel subscriptions

1. In a component that reacts (lol) to ably messages (less complicated).
2. Somewhere globally in the app, that then passes messages onwards via state management, props, or some other mechanism (more complicated).

Example for first one is in `ably-react-example-basic`

* App.js - React app that can toggle a component that uses ably on or off.
* components/AblyMessageComponent.js - A component that publishes and subscribes to an ably channel.

App.js is the standard create-react-app entry-point, with a checkbox added to toggle the Ably component on or off.

AblyMessageComponent.js shows how you can manage Ably channels correctly in react.

In it:

- The Ably client is created outside of the scope of the component and used inside of it.
- We setup state in the constructor
- We `get` the `Ably` channel in a `componentDidMount()` function.
- We subscribe in `componentDidMount()`
- We **unsubscribe** in `componentWillUnmount()`
- We setup a button click handler to send new Ably messages

Why this specific setup is important:

The Ably channel needs to remain connected while the component is visible and mounted in our application. By creating our channel subscriptions during `componentDidMount()` we make sure that as we toggle our Ably Component on and off, the client connects appropriately.

In addition to that, making sure that we `unsubscribe()` during `componentWillUnmount()` prevents us from using up Ably connections against our connection limit, while our users cannot interact with our component.

If you need multiple components to react to ably messages, you will need to manage this subscription and cascade the received messages in another way, probably from a parent component passing the received message data as props, or using your own state management solution.

Please note - in our example we have the Ably API key in the constructor call to `Ably.Realtime`, and in a production scenario, you should use `TokenAuthentication` instead, as putting your Ably API key directly into your react jsx markup exposes your API key to theft and abuse.

## Can I put ably code in my react functional components?

Yes, but you need to useState correctly (I forget how we did that, but we can work it out again)

## Where do I put Ably code in my (Classical?) components?

Yes! Create channels in constructors, and register on componentDidMount / unreigster on componentDidUnmount

## I'm using a state manager - like redux - how do I get my Ably code into my app?

Not really related, ably manages it's own state, you probably don't want these two things mixing directly.

## I think I'm opening multiple connections?

Probably because you're not managing useState or componentDidMount correctly

## Notes

Hello, I have an issue but I'm not sure what is causing it. I received an email telling I reached the thousands of messages on my app but I barely posted more than 100 as I'm doing test implementing ably, plus when I get the messages from the channel history I don't have thousands of messages, just those I posted. I'm only initialising my client once in the constructor
I'm using the reactjs framework and host on an azure web app

I am going through a tough time managing the ably connection. I am building a react native application and thought I am the only one testing and building the application, the active connections count sky rockets.
I have tried specifying clientId while opening connection, calling connection.off while unmount is called, but this is still not helping. Can you please direct me to some document which can help me resolve this issue. It could be the case where I am not doing things right. This appears to be an issue with fast refresh. While things work well when the view is refreshed, hot load causes multiple connections.
Even unsubscribing the channel in unmount doesn't do anything. Here's a tiny piece of code for you to refer : https://pastebin.com/vKCB1irZ

I’m using hot reload to develop a react app, but it is causing me to use up my ably messages and connection limits. How can I avoid this while in development?
