import React from 'react';
import axios from 'axios'
import sha256 from 'crypto-js/sha256';
import { bake_cookie, read_cookie, delete_cookie } from 'sfcookies';
import App from '../App';
import constants from '../constants.json';

class AdminComponent extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            adminName:"",
            token:"",
        };
    }

    componentDidMount(){
        this.setState({
            token : read_cookie("token"),
            adminName : read_cookie("adminName")
        });
    }

    logOutOnClick = () =>{
        delete_cookie("token");
        delete_cookie("adminName");
        this.setState({
            token:"",
            adminName:""
        });
    }

    render() {
       if(this.state.token == ""){
        return(<App/>);
       }
       return(
           <div>
               <button type="button" className="btn btn-sm btn-danger" onClick={() => { this.logOutOnClick() }}>LogOut</button>
               <hr/>
               <p>{this.state.adminName}</p>
               <p>{this.state.token}</p>
           </div>
       );
    }
}

export default AdminComponent;