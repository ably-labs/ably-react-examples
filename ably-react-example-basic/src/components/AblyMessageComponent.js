import React from 'react'
import Ably from "ably/promises";

const client = new Ably.Realtime("UeA-gA.7_OuZQ:0d-djBnnpwBMkxXc");

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