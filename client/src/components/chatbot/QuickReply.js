import React from 'react';


const QuickReply = (props) => {


    if (props.reply.structValue.fields.payload) {
        return (

            <a style={{ margin: 3, height: "auto", fontSize: "14px", textTransform: "none"}} href="/" className="btn btn-light"
               onClick={(event) =>
                   props.click(
                       event,
                       props.reply.structValue.fields.payload.stringValue,
                       props.reply.structValue.fields.text.stringValue
                   )
               }>
                {props.reply.structValue.fields.text.stringValue}
            </a>
        );
    } else {
        return (
          
            <a style={{ margin: 3, height: "auto"}} href={props.reply.structValue.fields.link.stringValue}>
                {props.reply.structValue.fields.text.stringValue}
            </a>
             
        );
    }

};

export default QuickReply;