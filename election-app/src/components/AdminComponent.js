import React from 'react';
import axios from 'axios'
import sha256 from 'crypto-js/sha256';
import { bake_cookie, read_cookie, delete_cookie } from 'sfcookies';
import App from '../App';
import constants from '../constants.json';
import ElectionDetails from './ElectionDetails';

class AdminComponent extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            adminName: read_cookie("adminEmail"),
            token: read_cookie("token"),
            electionDetails: { header: "", description: "" },
            candidates: [],
            electionsOfAdmin: [],
            selectedIdOfElectionForDetails : 0
        };
    }

     async getCreatedElections(){
        var output;
        const headers = { Authorization: `Bearer ${read_cookie("token")}` };
        await axios.get(`https://${constants.url}/api/admin/getcreatedelections`, { headers })
            .then(res => {
                if (res.status == 200) {
                    console.log("res.data");
                    console.log(res.data);
                    output = res.data;
                }
            }).catch(err => {
                output = [];
            });
        return output;
    }
    logOutOnClick = () => {
        delete_cookie("token");
        delete_cookie("adminName");
        this.setState({
            adminName: "",
            token: "",
            electionDetails: { header: "", description: "" },
            candidates: [],
            electionsOfAdmin: []
        });
    }
    electionContinueOnClick = () => {
        var electionHeader = document.getElementById("electionHeader").value;
        var electionDescription = document.getElementById("electionDescription").value;
        this.setState({
            electionDetails: { header: electionHeader, description: electionDescription }
        });
    }
    addCandidateOnClick = () => {
        var candidateName = document.getElementById("candidateName").value;
        var candidateDescription = document.getElementById("candidateDescription").value;
        var newCandidates = this.state.candidates;
        newCandidates.push({ name: candidateName, description: candidateDescription });
        this.setState({
            candidates: newCandidates
        });
    }
    createOnClick = async () => {
        const headers = { Authorization: `Bearer ${read_cookie("token")}` };
        var createElectionModel = {
            "electionDetails": this.state.electionDetails,
            "candidates": this.state.candidates
        }
        await axios.put(`https://${constants.url}/api/admin/createnewelection`, createElectionModel, { headers })
            .then(res => {
                if (res.status == 200) {
                    alert("election create success");
                    this.setState({
                        electionDetails: { header: "", description: "" },
                        candidates: []
                    });
                }
                alert(res.status);
            }).catch(err => {
                alert("election create failed");
            });
        this.setState({
            electionsOfAdmin:await this.getCreatedElections()
        });
    }
    ConditionalReturn = () => {
        if (this.state.electionDetails.description == "" && this.state.electionDetails.header == "") {
            return (
                <div>
                    <h5>create new election</h5>
                    <label>ELECTION DETAILS</label>
                    <input type="text" className="form-control" placeholder="header" id="electionHeader" autoComplete="off" /> <br />
                    <input type="text" className="form-control" placeholder="description" id="electionDescription" autoComplete="off" /> <br />
                    <button type="button" className="btn btn-sm btn-success" onClick={this.electionContinueOnClick}>Continue</button> <br />
                </div>
            );
        }
        else {
            return (
                <div>
                    <label>ADD CANDIDATES</label>
                    <input type="text" className="form-control" placeholder="name" id="candidateName" autoComplete="off" /> <br />
                    <input type="text" className="form-control" placeholder="description" id="candidateDescription" autoComplete="off" /> <br />
                    <button type="button" className="btn btn-sm btn-success" onClick={this.addCandidateOnClick}>Add</button> <br />
                    <div>
                        <h5>Added Candidates :</h5>
                        {
                            this.state.candidates.map((candidate) => {
                                return (
                                    <div>
                                        <hr/>
                                        <p>Candidate Name : {candidate.name}</p>
                                        <p>Candidate Description : {candidate.description}</p>
                                        <hr/>
                                    </div>
                                );
                            })
                        }
                    </div>
                    <div>
                        <button type="button" className="btn btn-sm btn-success" onClick={this.createOnClick}>APPROVE AND CREATE ELECTION</button> <br />
                    </div>
                </div>
            );
        }
    }
    async componentDidMount(){
        var elections = await this.getCreatedElections();
        this.setState({
            electionsOfAdmin : elections
        });
    }
    detailsOnClick=(electionId)=>{
        this.setState({
            selectedIdOfElectionForDetails : electionId
        });
    }
    goBackOnClick = () => {
        this.setState({
            selectedIdOfElectionForDetails:0
        });
    }

    render() {
        if (this.state.token == "") {
            return (<App />);
        }
        if(this.state.selectedIdOfElectionForDetails != 0){
            return (
                <div>
                    <button type="button" className="btn btn-sm btn-danger" onClick={this.goBackOnClick}>go back</button>
                    <ElectionDetails electionId={this.state.selectedIdOfElectionForDetails} elections={this.state.electionsOfAdmin}/>
                </div>
            );
        }
        return (
            <div style={{margin:"50px"}}>
                <button type="button" className="btn btn-sm btn-danger" onClick={this.logOutOnClick}>LogOut</button>
                <hr />
                <p>Welcome Admin : "{this.state.adminName}"</p>
                <hr />
                <hr/>
                <div style={{marginLeft:"35%", marginRight:"35%", width:"30%", textAlign:"center"}}>
                    {
                        this.state.electionsOfAdmin.map((election)=>{
                            return(
                                <div style={{border:"3px solid black", marginBottom:"20px"}}>
                                    <p>{election.id}</p>
                                    <p>{election.header}</p>
                                    <p>{election.isCompleted.toString()}</p>
                                    <button type="button" className="btn btn-sm btn-success" onClick={()=>this.detailsOnClick(election.id)}>Details</button>
                                </div>
                            );
                        })
                    }
                </div>
                <hr />
                <div>
                    <h4 style={{color:"blue"}}>{this.state.electionDetails.header}</h4>
                    <h5 style={{color:"blue"}}>{this.state.electionDetails.description}</h5>
                    {<this.ConditionalReturn />}
                </div>
            </div>
        );
    }
}

export default AdminComponent;