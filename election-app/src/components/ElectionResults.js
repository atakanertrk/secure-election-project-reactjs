import React from 'react';
import axios from 'axios'
import sha256 from 'crypto-js/sha256';
import { bake_cookie, read_cookie, delete_cookie } from 'sfcookies';
import App from '../App';
import constants from '../constants.json';

class ElectionResults extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            electionId: this.props.electionId,
            electionResults: []
        };
    }

    getElectionResults = async () => {
        var output;
        await axios.get(`https://${constants.url}/api/public/getelectionresultsifcompleted?electionId=${this.state.electionId}`)
            .then(res => {
                if (res.status == 200) {
                    console.log(res.data);
                    output = res.data;
                }
            }).catch(err => {
                output = [];
            });
        return output;
    }

    async componentDidMount() {
        var results = await this.getElectionResults();
        console.log(results);
        this.setState({
            electionResults: results
        });
    }

    render() {
        if(this.state.electionResults.length == 0){
            return (
                <div style={{margin:"50px"}}>
                     <button type="button" className="btn btn-sm btn-danger" onClick={()=>window.location.reload()}>go back</button> <br />
                     <hr/>
                    <h5 style={{color:"green"}}>This election is not completed yet id : {this.state.electionId}</h5>
                </div>
            );
        }
        return (
            <div style={{margin:"50px"}}>
                 <button type="button" className="btn btn-sm btn-danger" onClick={()=>window.location.reload()}>go back</button> <br />
                 <hr/>
                <h5 style={{color:"green"}}>Election results for election id : {this.state.electionId}</h5>
                <hr/>
                {
                    this.state.electionResults.map((result) => {
                        return (
                            <div style={{margin:"10px", border:"2px solid black", padding:"8px",display:"inline-block" }}>
                                <p>Id : <strong>{result.candidateId}</strong></p>
                                <p>Name : <strong>{result.candidateName}</strong></p>
                                <p>Votes : <strong>{result.votes}</strong></p>
                            </div>
                        );
                    })
                }
            </div>
        );
    }
}

export default ElectionResults;