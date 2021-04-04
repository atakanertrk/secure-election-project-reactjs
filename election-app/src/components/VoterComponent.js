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
            voterEmail: read_cookie("voterEmail"),
            assignedElections: [],
            detailsOfElection: [],
            detailsCandidates: [],
            deletailElectionIsVoted: -1
        };
    }

    logOutOnClick = async () => {
        delete_cookie("voterEmail");
        await this.setState({
            voterEmail: ""
        });
    }

    async getAssignedElections() {
        var output;
        const headers = { Authorization: `Bearer ${read_cookie("token")}` };
        await axios.get(`https://${constants.url}/api/voter/getelectionsofvoterbyemail?email=${this.state.voterEmail}`, { headers })
            .then(res => {
                if (res.status == 200) {
                    console.log("res.data");
                    console.log(res.data);
                    output = res.data;
                }
            }).catch(err => {
                output = [];
            });
        console.log(output);
        return output;
    }

    async detailsOnClick(electionId) {
        var index = this.state.assignedElections.findIndex(x => x.id == electionId);
        var details = this.state.assignedElections[index];
        var arrayDetails = this.state.detailsOfElection;
        arrayDetails.push(details);
        var candidates = await this.getCandidatesOfElection(electionId);
        var isVotedResult = await this.isVotedForElection(this.state.detailsOfElection[0].id);
        var _isVoted = -1;
        if (isVotedResult.isVoted == "True") {
            _isVoted = 1;
        }
        else if (isVotedResult.isVoted == "False") {
            _isVoted = 0;
        }
        this.setState({
            detailsOfElection: arrayDetails,
            detailsCandidates: candidates,
            deletailElectionIsVoted: _isVoted
        });
    }

    async getCandidatesOfElection(electionId) {
        var output = [];
        await axios.get(`https://${constants.url}/api/public/getcandidatesofelection?electionId=${electionId}`)
            .then(res => {
                if (res.status == 200) {
                    output = res.data
                }
            }).catch(err => {
                console.log("cannot get candidates of election, request failed");
            });
        return output;
    }

    async isVotedForElection(electionId) {
        var output;
        await axios.get(`https://${constants.url}/api/voter/isvotervoteforelection?electionId=${electionId}&email=${this.state.voterEmail}`)
            .then(res => {
                if (res.status == 200) {
                    output = res.data
                }
            }).catch(err => {
                console.log("cannot get is voted information from server");
            });
        return output;
    }

    goBackFromDetails = () => {
        this.setState({
            detailsOfElection: []
        });
    }

    async componentDidMount() {
        var elections = await this.getAssignedElections();
        this.setState({
            assignedElections: elections
        });
    }

    async voteCandidate(candidateId) {
        var password = document.getElementById("votePassword").value;
        alert(candidateId);
        alert(password);
        var hashedPassword = sha256(password).toString();
        alert(hashedPassword);
        if (password.length == 0) {
            alert("please write your password before vote");
        }
        else {
            const headers = { Authorization: `Bearer ${read_cookie("token")}` };
            var voteModel = {
                "email": this.state.voterEmail,
                "hashedPw": hashedPassword,
                "electionId": this.state.detailsOfElection[0].id,
                "vote": candidateId.toString()
            }
            console.log(voteModel);
            await axios.put(`https://${constants.url}/api/voter/vote`, voteModel, { headers })
                .then(res => {
                    if (res.status == 200) {
                        alert("vote success");
                        this.setState({
                            deletailElectionIsVoted : 1
                        });
                    }
                }).catch(err => {
                    alert("vote failed !");
                });
        }
        password = "";
    }

    ConditionalIsVotedComponent = (candidateId) => {
        if (this.state.deletailElectionIsVoted == 1) {
            return (
                <div>
                    <h4 style={{ color: "red" }}>You Already Have Voted For This Election</h4>
                    <div style={{ marginTop: "40px" }}>
                        <p>CANDIDATES:</p>
                        {
                            this.state.detailsCandidates.map((candidate) => {
                                return (
                                    <div style={{ border: "1px solid black", margin: "8px", width: "40%", padding: "8px" }}>
                                        <p>{candidate.id}</p>
                                        <p>{candidate.name}</p>
                                        <p>{candidate.description}</p>
                                    </div>
                                );
                            })
                        }
                    </div>
                </div>
            );
        }
        else {
            return (
                <div style={{ marginTop: "40px" }}>
                    <label>Your Password For Voting</label> <br />
                    <small>your password has been send to your email with name of the election</small> <br />
                    <input type="password" className="form-control" placeholder="password" id="votePassword" autoComplete="off" /> <br />
                    <p>CANDIDATES:</p>
                    {
                        this.state.detailsCandidates.map((candidate) => {
                            return (
                                <div style={{ border: "1px solid black", margin: "8px", width: "40%", padding: "8px" }}>
                                    <p>{candidate.id}</p>
                                    <p>{candidate.name}</p>
                                    <p>{candidate.description}</p>
                                    <button type="button" className="btn btn-sm btn-dark" onClick={() => this.voteCandidate(candidate.id)}>vote</button> <br />
                                </div>
                            );
                        })
                    }
                </div>
            );
        }
    };
    render() {
        if (this.state.voterEmail == "") {
            return (<App />);
        }
        if (this.state.detailsOfElection.length > 0) {
            return (
                <div style={{ margin: "15px" }}>
                    <button type="button" className="btn btn-sm btn-danger" onClick={this.goBackFromDetails}>GoBack</button>
                    <hr />
                    <p>ELECTION DETAILS:</p>
                    <div style={{ border: "1px solid black", margin: "8px", width: "40%", padding: "8px" }}>
                        <p>{this.state.detailsOfElection[0].id}</p>
                        <p>{this.state.detailsOfElection[0].header}</p>
                        <p>{this.state.detailsOfElection[0].description}</p>
                    </div>
                    {<this.ConditionalIsVotedComponent />}
                </div>
            );
        }
        return (
            <div style={{ margin: "50px" }}>
                <button type="button" className="btn btn-sm btn-danger" onClick={this.logOutOnClick}>LogOut</button>
                <hr />
                <h2>hey voter {this.state.voterEmail} </h2>
                <small>You can see assigned elections at the bottom</small> <br />
                <small>Select the election for voting, password details send to your email address for specified election</small> <br />
                <small style={{ color: "red" }}>if you dont see anything at the bottom, you probably not added to any election yet</small><br />
                <div style={{ marginTop: "20px" }}>
                    {
                        this.state.assignedElections.map((election) => {
                            return (
                                <div style={{ marginTop: "10px" }}>
                                    <small>{election.id}</small> <br/>
                                    <h6>Header: {election.header}</h6>
                                    <h6>Description: {election.description}</h6>
                                    <button type="button" className="btn btn-sm btn-success" onClick={() => this.detailsOnClick(election.id)}>Show Details</button>
                                </div>
                            );
                        })
                    }
                </div>
            </div>
        );
    }
}

export default VoterComponent;