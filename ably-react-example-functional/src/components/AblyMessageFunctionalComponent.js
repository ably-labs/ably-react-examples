import React, { useState, useEffect } from 'react';
import Ably from "ably/promises";

const Component = (props) => {

    const client = new Ably.Realtime("you-api-key-here");
    const channel = client.channels.get('some-channel');    
    
    const [ messages, updateMessages ] = useState([]);

    useEffect(() => {
        async function subscribe() {            
            await channel.subscribe(message => {
                console.log("A message was received", message);

                const newMessages = messages.slice();
                newMessages.push(message.data.text);

                updateMessages(newMessages);
            });
        }

        subscribe();

        return function cleanup() {
            channel.unsubscribe();
        };
    });
        
    const sendMessage = () => {
        channel.publish({ name: "myEventName", data: { text: "Some random stuff here." } });
    };

    return (
        <main>
            <button onClick={ (e) => sendMessage(e) }>Click here to send a message</button>
            <h2>Messages will go here:</h2>
            <ul> 
                { messages.map((text, index) => (<li key={"item" + index}>{text}</li>)) }
            </ul>
        </main>
    )    
};

export default Component;