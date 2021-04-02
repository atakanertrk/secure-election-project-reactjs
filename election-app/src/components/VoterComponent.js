import React from 'react';
import axios from 'axios'
import sha256 from 'crypto-js/sha256';
import { bake_cookie, read_cookie, delete_cookie } from 'sfcookies';
import App from '../App';
import constants from '../constants.json';

class VoterComponent extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            voterEmail:"",
        };
    }

    componentDidMount(){
        this.updateState();
    }
    updateState = async () =>{
        await this.setState({
            voterEmail : read_cookie("voterEmail")
        });
    }

    logOutOnClick = async () =>{
        delete_cookie("voterEmail");
        await this.setState({
            voterEmail:""
        });
    }

    render() {
        if(this.state.voterEmail == ""){
            return(<App/>);
        }
       return(
           <div>
               <button type="button" className="btn btn-sm btn-danger" onClick={this.logOutOnClick}>LogOut</button>
               <hr/>
               <h2>hey voter {this.state.voterEmail} </h2>
           </div>
       );
    }
}

export default VoterComponent;