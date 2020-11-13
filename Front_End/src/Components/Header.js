import React, { Component, Fragment} from 'react'
import '../App.css';
import logo from '../images/munchy_logo.png'
import {connect} from 'react-redux'
import PropTypes from 'prop-types'
import {login} from '../actions/authAction'
import {register} from '../actions/authAction'
import {clearErrors} from '../actions/errorActions'
import Logout from "./Logout"
import {} from "@fortawesome/free-solid-svg-icons";
import {faUserAlt} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'



import {
    Collapse,
    Navbar,
    NavbarToggler,
    NavbarBrand,
    Nav,
    NavItem,
    NavLink,
    UncontrolledDropdown,
    DropdownToggle,
    DropdownMenu,
    Modal, ModalHeader, ModalBody, ModalFooter,
    DropdownItem
} from 'reactstrap';



class Header extends Component {
    constructor(props) {
        super(props);

        this.toggle = this.toggle.bind(this);
        this.state = {
            isOpen: false,
            navCollapsed: true,
            showNavbar: false,
            modal: false
        };
    }
    toggle() {
        this.setState({
            isOpen: !this.state.isOpen
        });
    }
    static propTypes = {
        isAuthenticated : PropTypes.bool,
        error : PropTypes.object.isRequired,
        login: PropTypes.func.isRequired,
        clearErrors: PropTypes.func.isRequired,
        auth: PropTypes.object.isRequired

    };

    
   
    render() {
        const {isAuthenticated, user} = this.props.auth
        const { navCollapsed } = this.state
        const AuthNav = (
            <Fragment>
            <NavItem>
            <span>
           {/* { user ? `Welcome ${user.firstName}` : '' } */}
            </span>
            </NavItem>
            </Fragment>
          )
        return (
            
            <div className="bottomBorder">
                <Navbar className="Header" dark expand="sm">
                    <img className="logo" src={logo} alt=""/>
                    <NavbarToggler onClick={this.toggle} />
                    <Collapse isOpen={this.state.isOpen} navbar>
                    {isAuthenticated ? 
                    <Nav className="ml-auto"  navbar>
                    <NavItem >
                    <UncontrolledDropdown  nav inNavbar>
                    <DropdownToggle nav caret>
                    <FontAwesomeIcon icon={faUserAlt} /> My Account
                    </DropdownToggle>

                    <DropdownMenu className ="account_nav" right>
                      <DropdownItem className ="account_nav">
                        {AuthNav}
                      </DropdownItem>
                      <DropdownItem divider />
                      <DropdownItem className ="account_nav">
                        Account Settings
                      </DropdownItem>

                      
                      <DropdownItem className ="account_nav">
                      <Logout />
                      </DropdownItem>
                    </DropdownMenu>
                  </UncontrolledDropdown>
                    </NavItem>

                    <NavItem>
                        <NavLink href="/recipes">Your Recipes</NavLink>
                    </NavItem>

                    <NavItem>
                        <NavLink href="/coockbook">Your Cookbook</NavLink>
                    </NavItem>
             
                </Nav> :  <Nav className="ml-auto" navbar>
                <NavItem>
                 <NavLink href="/login">Sign in</NavLink>
                </NavItem>

                <NavItem>
                    <NavLink href="/signup">Sign up</NavLink>
                </NavItem>
         
            </Nav>}
                    
                    
                   
                    </Collapse>
                    
                </Navbar>
                
                
            </div>
        )
    }
}
const mapStateToProps = state =>({
    isAuthenticated : state.auth.isAthenticated,
    error: state.error,
    auth: state.auth

})
export default connect (
    mapStateToProps,
    {login, register, clearErrors}
)(Header);