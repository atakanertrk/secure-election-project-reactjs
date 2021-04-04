import React from 'react';
import axios from 'axios'
import sha256 from 'crypto-js/sha256';
import { bake_cookie, read_cookie, delete_cookie } from 'sfcookies';
import App from '../App';
import constants from '../constants.json';

class ElectionDetails extends React.Component {
    constructor(props) {
        super(props);
        var index = this.props.elections.findIndex(x => x.id == this.props.electionId);
        var details = this.props.elections[index];
        this.state = {
            electionDetails: details,
            candidates: [],
            votersOfElection: [],
            ignore:""
        }
    }
// complete election
    async getCandidatesOfElection() {
        var output = [];
        await axios.get(`https://${constants.url}/api/public/getcandidatesofelection?electionId=${this.props.electionId}`)
            .then(res => {
                if (res.status == 200) {
                    output = res.data
                }
            }).catch(err => {
                console.log("cannot get candidates of election, request failed");
            });
        return output;
    }

    async getVotersOfElection() {
        const headers = { Authorization: `Bearer ${read_cookie("token")}` };
        var output = [];
        await axios.get(`https://${constants.url}/api/admin/getvotersofelection?electionId=${this.props.electionId}`, { headers })
            .then(res => {
                if (res.status == 200) {
                    output = res.data
                }
            }).catch(err => {
                console.log("cannot get voters of election, request failed");
            });
        console.log("outpt");
        console.log(output);
        return output;
    }

    addVoterOnClick = async () => {
        var email = document.getElementById("voterEmail").value;
        const headers = { Authorization: `Bearer ${read_cookie("token")}` };
        var addVoterModel = {
            "email": email,
            "electionId": this.props.electionId
        }
        await axios.put(`https://${constants.url}/api/admin/addvotertoelection`, addVoterModel, { headers })
            .then(res => {
                if (res.status == 200) {
                    alert("voter added successfuly");
                    this.updateState();
                }
                alert(res.status);
            }).catch(err => {
                alert("cannot add voter");
            });
    }

    deleteVoterFromElection = async (email) => {
        await axios.delete(
            `https://${constants.url}/api/admin/deletevoterfromelection`, {
            headers: {
                Authorization: `Bearer ${read_cookie("token")}`
            },
            data: {
                "electionId": this.props.electionId,
                "email": email
            }
        })
            .then(res => {
                if (res.status == 200) {
                    alert("voter deleted from election");
                    this.updateState();
                }
            }).catch(err => {
                alert("cannot delete voter, voter might vote for election already");
            });
    }

    completeElectionOnClick = async ()=>{
        const headers = { Authorization: `Bearer ${read_cookie("token")}` };
        await axios.post(`https://${constants.url}/api/admin/completetheelection?electionId=${this.props.electionId}`, {} ,{ headers })
            .then(res => {
                if (res.status == 200) {
                    alert("election completed/closed/finished !");
                }
            }).catch(err => {
                alert("cannot complete/finish the election");
            });
        window.location.reload();
    }

    async componentDidMount() {
        this.updateState();
    }

    updateState = async () =>{
        var _candidates = await this.getCandidatesOfElection();
        var _votersOfElection = await this.getVotersOfElection();
        this.setState({
            candidates: _candidates,
            votersOfElection: _votersOfElection
        });
    }

    render() {
        console.log("render");
        console.log(this.state.candidates);
        return (
            <div style={{margin:"50px"}}>
                <hr />
                <h4>election id : {this.props.electionId}</h4>
                <hr />
                <div>
                    <h5>details of election</h5>
                    <p>Header: {this.state.electionDetails.header}</p>
                    <p>Description: {this.state.electionDetails.description}</p>
                    <p>Is Election Completed: {this.state.electionDetails.isCompleted.toString()}</p>
                    <button type="button" className="btn btn-sm btn-danger" onClick={this.completeElectionOnClick}>complete</button> <br />
                    <small>when you complete the election, results will be available publicly via election id</small>
                </div>
                <hr/>
                <hr />
                <div>
                    <h5>candidates of election :</h5>
                    {
                        this.state.candidates.map((candidate) => {
                            return (
                                <div style={{ width: "50%" }}>
                                    <p>name : {candidate.name}</p>
                                    <p>description : {candidate.description}</p>
                                    <hr />
                                </div>
                            );
                        })
                    }
                </div>
                <hr />
                <div>
                    <h5>Assigned Voters Of Election</h5>
                    <small>password will be send to email address automaticaly</small>
                    {
                        this.state.votersOfElection.map((email) => {
                            return (
                                <div>
                                    <p>{email}</p>
                                    <button type="button" className="btn btn-sm btn-danger" onClick={() => this.deleteVoterFromElection(email)}>delete from election</button> <br />
                                    <small>you cant delete the voter if he/she already voted for election</small>
                                    <hr />
                                </div>
                            );
                        })
                    }
                </div>
                <hr />
                <div>
                    <h5>Add Voter To Election</h5>
                    <input type="text" className="form-control" placeholder="something@provider.com" id="voterEmail" autoComplete="off" /> <br />
                    <button type="button" className="btn btn-sm btn-success" onClick={this.addVoterOnClick}>Add</button> <br />
                </div>
            </div>
        );
    }
}

export default ElectionDetails;