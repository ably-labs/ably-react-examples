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

Yes! You can do all the things from our `ably-react-example-basic` using `functional components` instead of `classical componenets`.

We've converted the example above into a `functional componenet` in the directory `ably-react-example-functional` so you can see how that would look. At a glance, it's a little more confusing to look at - but if you're comfortable with functional components, it shouldn't be too surprising.

In it, we:

- Create our functional component
- Create an instance of the ably client, and our channel inside the function.
- Define variable using `useState` called `messages`, along with it's corresponding `updateMessages` function.
- We then use `useEffect` to manage our subscriptions.
- Three important things are happening in here
    - Subscribing to our channel, along with a callback that updates our messages by calling `updateMessages`.
    - The subscription function is wrapped and called `async` to prevent race conditions in react, so we're calling it using `subscribe()` inside of the `useEffect` callback.
    - We're returning a `cleanup` function, that unsubscribes from our channel.

- We've converted our sendMessage function syntax to use the form `const sendMessage = () => { ... }` rather than `function sendMessage` so that we can define it in the body of our functional component.
- The rest of the code remains unchanged.

Much like the first example, it's important to ensure that your `cleanup` function contains an `unsubscribe` call, so you don't leak ably connections.

The same caveat to using API keys applies here, as it does to the previous sample - please use TokenAuthentication.


## Where do I put Ably code in my (Classical?) components?

Our `ably-react-example-basic` shows how you can use classical components to call the ably SDK.

If you're using purely `presentational componenets` you might want to manage the ably SDK in a `higher order component` that passes message contents to the `presentational componenets` as props.

It's recommended to create the ably client and channels in the portions of your application that use them. If your entire application uses `Ably`, you probably want to define it higher up - maybe even in the App itself, and reuse messages, or channels to prevent opening lots of connections.

Keep in mind, that whenever you create a client and subscribe to a channel, a connection to ably will be opened, that counts towards your connection limits.

## I'm using a state manager - like redux - how do I get my Ably code into my app?

You could always create and manage the Ably client external to your application, and use a state management solution like `Redux` to emit events.
While this is probably more complicated, you could always subscribe to channels, and raise events in your state management store, and have the store cascade these events to the other components in your application that are connected to the store.

It's hard to give concerete advice around this topic, because applications can be built in different ways, but if you have any specific questions, please contact support.

## I think I'm opening multiple connections?

There are a few obvious reasons that this might happen:

1. You're using react classical components, and not unsubscribing in `componentWillUnmount()`
2. You're using react functional componenets and you haven't returned a cleanup function that unsubscribes during a call to `useEffect`
3. You're using a component that subscribes to a channel, which you use for multiple things, and your Ably Client is defined *inside* that component

If you want to make sure you're doing the first two of these correctly, please check the samples `ably-react-example-basic` and `ably-react-example-functional`.

The third is subtle and tricky.

Imagine you have a react component that looks like this:

```js
export default class AblyMessageComponent extends React.Component {
    constructor() {
        super();
        this.state = { messages: [] };
        this.client = new Ably.Realtime("ably-api-key-here");
    }

    async componentDidMount() {
        this.channel = await this.client.channels.get("my-cool-channel");

        await this.channel.subscribe(message => {
            console.log("A message was received", message);

            this.state.messages.push(message.data.text);
            this.setState({ messages: this.state.messages });
        });

        console.log("You are subscribed");
    }

    async componentWillUnmount() {
        this.channel.unsubscribe();

        console.log("You are unsubscribed");
    }

    sendMessage() {
        this.channel.publish({ name: "myEventName", data: { text: "Some random stuff here." } })
    }

    render() {
        return (
            <main>
                <button onClick={ (e) => this.sendMessage(e) }>Click here to send a message</button>
                <h2>Messages will appear here:</h2>
                <ul>
                    {this.state.messages.map((text, index) => (<li key={"item" + index}>{text}</li>))}
                </ul>
            </main>
        )
    }
}
```
This seems sane - it's a component that connects to ably, and subscribes to a channel.
If you pay close attention, you'll notice that we're creating an instance of the Ably.Realtime client in the constructor of the component in a way that could cause an issue in your application.

If you were to use this component multiple times in your web application (for example, to render the current price of some stocks for multiple stocks/share prices), what would actually happen is a new ably connection would be opened for each subscription, quickly using up your connection limit.

By making a subtle change to this component like this...

```js

const client = new Ably.Realtime("ably-api-key-here");

export default class AblyMessageComponent extends React.Component {
    constructor() {
        super();
        this.state = { messages: [] };
    }

    async componentDidMount() {
        this.channel = await client.channels.get("my-cool-channel");

        await this.channel.subscribe(message => {
            console.log("A message was received", message);

            this.state.messages.push(message.data.text);
            this.setState({ messages: this.state.messages });
        });

        console.log("You are subscribed");
    }
....
```
and defining the `client` outside of the scope of the `React.Component`, the same client instance - and as such - the same `web socket connection`, would be shared by all instances of that component.
That's totally fine, and each components subscription would still operate independently, but you would not run out of connections if you rendered this component many times on one page.


## Thoughts about hot reload

If you're in development mode, using hot-reload, you may make this issue even worse.
Hot reload replaces portions or all of your site during development mode. This is great for productivity - effectively "reloading" the browser tab, or portions of the browser tab, right in front of you, even if it doesn't look like that's what is happening to human eyes.

If you hot-reload a React component (or just a webpage) that contains code that connects to Ably, your ably connection will be rapidly disconnected and reconnected as part of the reload - if you've made the mistake above, and are already opening lots of connections inside of React components, you might find that hot reload rapidly uses up your connection limits.

If you find this is happening to you during dev, and you're constantly hitting your ably connection limits, we'd recommend stubbing out the Ably SDK with a mock of some kind.

Mocking and stubbing, at least in the browser, is when you create a new JavaScript object that matches the function signatures of our SDKs, but actually doesn't call Ably at all. Mocks and stubs are great for testing, as you can add your own logic to simulate messages, and capture the output of messages that **would** have been sent if you were using our real SDKs.

Here's an example of an stubbed implementation of `Ably/Promises` that we occasionally use in tests, to verify the behaviour of Ably, and you could use to make sure you are not using up all your connection limits during development.

```js
const fakeAblyChannel = {
  published: [],
  subscribe: function(callback) {
      this.callback = callback;
  },
  publish: function(message) {
      this.published.push(message);
      this.callback(message);
  }
}

class AblyStub {
  fakeAblyChannel = fakeAblyChannel;
  connection = { on: function(string) { } };
  channels = { get: function(chName) { return fakeAblyChannel; } }
}

window.Ably = { Realtime: { Promise: AblyStub } };
```

All this stub does, is push any messages that are sent to an internal array called `published`, and simulates a subscription to any ably channel.
You can use this stub like our normal SDK for publishing and subscribing, and it'll **loosely** behave the same.
