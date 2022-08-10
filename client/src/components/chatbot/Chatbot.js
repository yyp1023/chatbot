import React, { Component } from 'react';
import axios from "axios/index";
import Cookies from 'universal-cookie';
import { v4 as uuid } from 'uuid';
import Message from './Message';
import Card from './Card';
import QuickReplies from './QuickReplies';
import '../css/chatbot.css'
import { Dropdown, OverlayTrigger, Popover, Button } from 'react-bootstrap'
import emailjs from 'emailjs-com';


const cookies = new Cookies();
class Chatbot extends Component {
    messagesEnd
    talkInput
    nameInput = false
    constructor(props) {
        super(props);
        // This binding is necessary to make `this` work in the callback
        this._handleInputKeyPress = this._handleInputKeyPress.bind(this);
        this._handleQuickReplyPayload = this._handleQuickReplyPayload.bind(this);
        this._handleChange = this._handleChange.bind(this);
        this._handleInputKeyClick = this._handleInputKeyClick.bind(this);
        this._handleSomethingWentWrong = this._handleSomethingWentWrong.bind(this);
        this.hide = this.hide.bind(this);
        this.show = this.show.bind(this);

        this.state = {
            input: '',
            messages: [],
            showBot: false,
            problem: ''
        };
        if (cookies.get('userID') === undefined) {
            cookies.set('userID', uuid(), { path: '/' });
        }
    }


    async df_text_query(queryText) {
        let says = {
            speaks: 'user',
            msg: {
                text: {
                    text: queryText
                }
            }
        }
        this.setState({ messages: [...this.state.messages, says] })
        const res = await axios.post('/api/df_text_query', { text: queryText, userID: cookies.get('userID') })
        for (let msg of res.data.fulfillmentMessages) {
            says = {
                speaks: 'ITClan',
                msg: msg
            }
            this.setState({ messages: [...this.state.messages, says] })
        }
    };


    async df_event_query(eventName) {
        const res = await axios.post('/api/df_event_query', { event: eventName, userID: cookies.get('userID') })
        for (let msg of res.data.fulfillmentMessages) {
            let says = {
                speaks: 'ITClan',
                msg: msg
            }
            this.setState({ messages: [...this.state.messages, says] })
        }
    }


    componentDidMount() {
        this.df_event_query('Welcome');
    }


    componentDidUpdate() {
        this.messagesEnd.scrollIntoView(true, { behavior: "smooth", alignToTop: 'false' });
        if (this.talkInput && this.state.problem == '') {
            this.talkInput.focus();
        }
    }

    show(event) {
        event.preventDefault();
        event.stopPropagation();

        this.setState({ showBot: true });
        this.componentDidUpdate()
    }

    hide(event) {
        event.preventDefault();
        event.stopPropagation();
        this.setState({ showBot: false });
    }


    _handleQuickReplyPayload(event, payload, text) {
        event.preventDefault();
        event.stopPropagation();

        this.df_text_query(text);
    }


    renderCards(cards) {
        return cards.map((card, i) => <Card key={i} payload={card.structValue} />);
    }


    renderOneMessage(message, i) {
        if (message.msg && message.msg.text && message.msg.text.text && message.msg.text.text !== this.nameInput) {
            return <Message key={i} speaks={message.speaks} text={message.msg.text.text} />;
        }
        else if (message.msg && message.msg.payload.fields.cards) { //message.msg.payload.fields.cards.listValue.values

            return <div key={i} >
                <div className="card-panel grey lighten-5 z-depth-1">
                    <div style={{ overflow: 'hidden' }}>
                        <div style={{ overflowY: 'hidden' }}>
                            <div className='row' style={{ width: message.msg.payload.fields.cards.listValue.values.length * 270 }}>
                                {this.renderCards(message.msg.payload.fields.cards.listValue.values)}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        }
        else if (message.msg &&
            message.msg.payload &&
            message.msg.payload.fields &&
            message.msg.payload.fields.quick_replies) {
            return <QuickReplies
                text={message.msg.payload.fields.text ? message.msg.payload.fields.text : null}
                key={i}
                replyClick={this._handleQuickReplyPayload}
                speaks={message.speaks}
                payload={message.msg.payload.fields.quick_replies.listValue.values}
            />;
        }
    }


    renderMessages(returnedMessages) {
        if (returnedMessages) {
            return returnedMessages.map((message, i) => {
                return this.renderOneMessage(message, i);
            }
            )
        } else {
            return null;
        }
    }


    _handleInputKeyPress(e) {
        if (e.key === 'Enter' && e.target.value !== "") {
            this.df_text_query(e.target.value);
            e.target.value = '';
            this.setState({ input: '' });
        }
    }

    resetMessagesOnButtonClick() {
        this.setState({ messages: [] })
        this.componentDidMount()
    }

    _handleChange(e) {
        this.setState({ input: e.target.value });
    }


    _handleInputKeyClick() {
        if (this.state.input !== "") {
            this.df_text_query(this.state.input);
            this.setState({ input: '' });
        }
    }

    endChatButtonClick() {
        this.resetMessagesOnButtonClick()
        this.setState({ showBot: false })
    }

    _handleSomethingWentWrong(e) {
        this.setState({ problem: e.target.value });
    }

    sendEmail(e) {
        e.preventDefault();
        emailjs.sendForm(
            'service_88k02y9',
            'template_smvxuyn',
            e.target,
            '5uBbYyKKPXTiMsXr7'
        ).then(res => {
            console.log(res);
        }).catch(err => {
            console.log(err);
        });
    }

    render() {
        if (this.state.showBot) {
            return (
                <div style={{ minHeight: 600, maxHeight: 800, width: 400, position: 'absolute', bottom: 0, right: 0, border: '1px solid lightgray', margin: 50, backgroundColor: 'white' }}>
                    <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet" />
                    <div className="blue" style={{ height: '60px' }}>
                        <div className="row">
                            <div className='col left align pt-2'>
                                <div className='icon-container'>
                                    <img className='bot-img' alt="bot" src={require('../img/bot.png')} />
                                    <div className='status-circle'></div>
                                </div>
                            </div>
                            <div className='col font-monospace white-font text-light'>
                                <div className='fs-4 text-uppercase center fw-bold lh-1 pt-2'>itclan</div>
                                <div className='center fw-lighter'>Online</div>
                            </div>
                            <div className='col'>
                                <div className='row' style={{ alignItems: 'center' }}>
                                    <Dropdown className='col-6'>
                                        <Dropdown.Toggle className='removecaret transparent border-0 shadow-none'>
                                            <img type="button" className='btn-link' src={require('../img/preferences.png')} alt="settings" />
                                        </Dropdown.Toggle>
                                        <Dropdown.Menu>
                                            <>
                                                {
                                                    <OverlayTrigger
                                                        ref="overlay"
                                                        rootClose={true}
                                                        rootCloseEvent="click"
                                                        trigger="click"
                                                        key="bottom"
                                                        placement="bottom"
                                                        overlay={
                                                            <Popover id={`popover-positioned-bottom`}>
                                                                <Popover.Header as="h3">Are you sure you want to end the chat?</Popover.Header>
                                                                <Popover.Body className='center'>
                                                                    <Button className='m-3' onClick={() => { this.endChatButtonClick() }}>Yes</Button>
                                                                    <Button className='m-3' onClick={() => document.body.click()}>No</Button>
                                                                </Popover.Body>
                                                            </Popover>
                                                        }
                                                    >
                                                        <button className="w-100 border-white border-0 bg-transparent">End Chat</button>
                                                    </OverlayTrigger>
                                                }
                                            </>

                                            <Dropdown.Divider />
                                            <>
                                                {
                                                    <OverlayTrigger
                                                        ref="overlay"
                                                        rootClose={true}
                                                        rootCloseEvent="click"
                                                        trigger="click"
                                                        key="bottom"
                                                        placement="bottom"
                                                        overlay={
                                                            <Popover id={`popover-positioned-bottom`}>
                                                                <Popover.Header as="h3">Please describe the problem that you had.</Popover.Header>
                                                                <Popover.Body className='center'>
                                                                    <form onSubmit={this.sendEmail}>
                                                                        <label>Message</label>
                                                                        <textarea type='text' name='message' style={{ height: '100px' }} onChange={this._handleSomethingWentWrong} />
                                                                        <Button className='m-3' type='submit' onClick={() => document.body.click()} disabled={this.state.problem == ''}>Send</Button>
                                                                        <Button className='m-3' onClick={() => document.body.click()}>Cancel</Button>
                                                                    </form>
                                                                </Popover.Body>
                                                            </Popover>
                                                        }
                                                    >
                                                        <button className="w-100 border-white border-0 bg-transparent">Something's Went Wrong</button>
                                                    </OverlayTrigger>
                                                }
                                            </>
                                        </Dropdown.Menu>
                                    </Dropdown>
                                    <img type="button" className='btn-link col-4' src={require('../img/close.png')} alt="close" height='20px' width='20px' onClick={this.hide} />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div>
                        <div style={{ minHeight: 588, maxHeight: 588, width: '100%', overflow: 'auto' }}>
                            {this.renderMessages(this.state.messages)}
                            <div ref={(el) => { this.messagesEnd = el; }}
                                style={{ float: "left", clear: "both" }}>
                            </div>
                        </div>

                        <div className="col s12 flex">
                            <a className="waves-effect waves-light btn" onClick={() => { this.resetMessagesOnButtonClick() }}><i className="material-icons">replay</i></a>
                            <input style={{ margin: 0, paddingLeft: '1%', paddingRight: '1%', width: '98%' }} ref={(input) => { this.talkInput = input; }} placeholder="type a message:" value={this.state.input} onChange={this._handleChange} onKeyPress={this._handleInputKeyPress} id="user_says" type="text" />
                            <a className="waves-effect waves-light btn" onClick={this._handleInputKeyClick}><i className="material-icons">send</i></a>
                        </div>
                    </div>
                </div>
            );
        } else {
            return (
                <div className='border border-white m-5' style={{ minHeight: 40, maxHeight: 500, width: 100, position: 'absolute', bottom: 0, right: 0, border: '1px solid lightgray' }}>
                    <div ref={(el) => { this.messagesEnd = el; }}
                        style={{ float: "left", clear: "both" }}>
                    </div>
                    <img className='btn rounded-circle' onClick={this.show} alt="bot" src={require('../img/bot.png')} style={{ height: '50px', width: '80px' }} />
                </div>
            );
        }
    }
}
export default Chatbot;