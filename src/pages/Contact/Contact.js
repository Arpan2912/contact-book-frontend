import React, { Component } from 'react';
import { Row, Col, Card, CardBody, Table, Form, FormGroup, Label, Input, Button } from 'reactstrap';

import Pagination from '../../components/Pagination/Pagination';

import ContactService from '../../services/ContactService';
import Validation from '../../services/Validation';

import AddContact from '../../modal/AddContact';
import UploadContact from '../../modal/UploadContactModal';

import {downlodFile} from '../../utils';
import './Contact.css';

const pageSize = 10;
const downloaCheckboxArray=[
    {
        key:'All',
        value:'all'   
    },
    {
        key:'Name',
        value:'name'   
    },
    {
        key:'Mobile',
        value:'mobile'   
    },
    {
        key:'Members',
        value:'members'   
    },
    {
        key:'Address',
        value:'address'   
    },
    {
        key:'Samaaj',
        value:'samaaj'   
    },
    {
        key:'Living',
        value:'living'   
    },
    {
        key:'Income',
        value:'income'   
    },
    {
        key:'Detail',
        value:'detail'   
    },
]

class Contact extends Component {
    state = {
        contacts: [],
        downloadExcelFields:['all'],
        selectedContactToUpdate: null,
        isAddContactModalOpen: false,
        isUploadContactModalOpen: false,
        page: 1,
        totalRecords: 0,
        search: null,
        controls:{
            downloadCheckbox: {
                value: ['all'],
                valid: null,
                touched: false,
                required: true,
                showErrorMsg: false
              },
        }
    }

    componentDidMount() {
        this.getContacts(this.state.page);
    }

    getContacts = (page, search,isDownload) => {
        let {controls}=this.state;
        let {downloadCheckbox}=controls;
        let body={
            downloadExcelFields:downloadCheckbox.value
        }
        ContactService.getContacts(page, pageSize, search,isDownload,body)
            .then(data => {
                console.log(data.data);
                if(isDownload){
                    if(data.data.data && data.data.data.file){
                        downlodFile(data.data.data.file);
                    }
                } else {
                    const contacts = data.data.data.contacts;
                    const totalRecords = data.data.data.count;
                    this.setState({ contacts, totalRecords });
                }      
            })
            .catch(e => {

            })
    }

    openAddContactModal = (contactData) => {
        this.setState({ isAddContactModalOpen: true, selectedContactToUpdate: contactData });
    }
    closeAddContactModal = (reload) => {
        console.log("closing modal");
        this.setState({ isAddContactModalOpen: false, selectedContactToUpdate: null });
        if (reload) {
            this.getContacts(this.state.page);
        }
    }


    openUploadContactModal = () => {
        this.setState({ isUploadContactModalOpen: true });
    }
    closeUploadContactModal = (reload) => {
        this.setState({ isUploadContactModalOpen: false });
        if (reload) {
            this.getContacts(this.state.page);
        }
    }

    handlePageChange = (page) => {
        this.setState({ page: page });
        this.getContacts(page, this.state.search);
        // this.getAllDealerReport(page, null, false, uuid);
    }

    handleSearchInput = (e) => {
        const value = e.target.value;
        this.setState({ search: value });
        this.searchContactData(value);
    }

    searchContactData = (search) => {
        this.setState({ page: 1 });
        this.getContacts(1, search);
    }

    downloadExcel=()=>{
        this.getContacts(this.state.page,this.state.search,true);
    }

    handledownloadCheckboxInput = (e) => {
        const { controls } = this.state;
        const { downloadCheckbox } = controls;
        let checkBoxValue = downloadCheckbox.value;
        let valueIndex = checkBoxValue.indexOf(e);
        if (valueIndex < 0) {
          if ((e !== 'all' && checkBoxValue && checkBoxValue[0] === 'all') || e === 'all') {
            checkBoxValue = [e];
          } else {
            checkBoxValue.push(e);
          }
        } else {
          checkBoxValue.splice(valueIndex, 1);
        }
        downloadCheckbox.value = checkBoxValue;
        
        this.setState({ controls })
      }

    render() {
        const { contacts, selectedContactToUpdate, isAddContactModalOpen,
             page, totalRecords, search,controls,
             isUploadContactModalOpen
            } = this.state;
        const {downloadCheckbox}=controls;
        const prepareRows = contacts.map(c => <tr>
            <td>{c.name}</td>
            <td>
                <div>{c.mobile1}</div>
                <div>{c.mobile2}</div>
                <div>{c.mobile3}</div>
                <div>{c.mobile4}</div>
            </td>
            <td>{c.email}</td>
            <td>{c.address}</td>
            <td>{c.samaaj}</td>
            <td>{c.family_members}</td>
            <td>{c.income}</td>
            <td>{c.living}</td>
            <td>{c.additional_detail}</td>
            <td onClick={this.openAddContactModal.bind(this, c)}>edit</td>
        </tr>)
        return (
            <div id="contact">
                {isAddContactModalOpen &&
                    <AddContact
                        show={isAddContactModalOpen}
                        closeModal={this.closeAddContactModal}
                        contactData={selectedContactToUpdate}>
                    </AddContact>}

                    {isUploadContactModalOpen &&
                    <UploadContact
                        show={isUploadContactModalOpen}
                        closeModal={this.closeUploadContactModal}
                        >
                    </UploadContact>}
                <Row>
                    <Col xl="10">
                        <Card>
                            <CardBody>
                                <Row>
                                    <Col sm="4">
                                        <Input
                                            name="search"
                                            id="search"
                                            type="text"
                                            placeholder="Enter person name,phone numeber or company"
                                            onChange={this.handleSearchInput}
                                            value={search}
                                        ></Input>
                                    </Col>
                                    <Col className="text-align-right">
                                    <span className="download-link" onClick={this.openAddContactModal.bind(this, null)}>Add Contact</span>&nbsp;&nbsp;
                                        <span className="download-link" onClick={this.openUploadContactModal}>Upload Contact</span>
                                    </Col>
                                </Row>

                                <Table className="width-100 margin-top-10">
                                    <thead>
                                        <tr>
                                            <th>Name</th>
                                            <th>Phone</th>
                                            <th>Email</th>
                                            <th>Address</th>
                                            <th>Samaaj</th>
                                            <th>Family Members</th>
                                            <th>Income</th>
                                            <th>Living</th>
                                            <th>Additional Detail</th>
                                            <th>Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {prepareRows}
                                    </tbody>
                                </Table>
                                {<Pagination
                                    margin={2}
                                    page={page}
                                    pageSize={pageSize}
                                    totalRecords={totalRecords}
                                    onPageChange={this.handlePageChange}
                                ></Pagination>}
                            </CardBody>
                        </Card>
                    </Col>
                    <Col sm="2">
                        <Card>
                            <CardBody>
                    <Row className="font-weight-bold">
                        <Col>
                        Download Excel
                        </Col>
                        </Row>
                        <Row>
                        {downloaCheckboxArray.map(d=>
                        <Col sm="12">
                            <label>
                                <input type="checkbox"
                                name="checkbox"
                                id="checkbox"
                                className="option-text"
                                checked={downloadCheckbox.value.includes(d.value)}
                                onChange={this.handledownloadCheckboxInput.bind(this, d.value)}
                                />
                                {"  "}{d.key}
                                <span class="checkmark"></span>
                            </label>
                                    
                            </Col>
                             )}
                        </Row>
                       <Row onClick={this.downloadExcel}>
                           <Col className="download-link">
                                Download
                           </Col>
                           </Row>
                       </CardBody>
                    </Card>
                </Col>
                </Row>

            </div>
        );
    }
}

export default Contact;