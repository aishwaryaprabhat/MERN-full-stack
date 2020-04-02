import React, {useState, Fragment} from 'react';
import axios from 'axios';
import {Link} from 'react-router-dom';
import {connect} from 'react-redux';
import PropTypes from 'prop-types'
import {login} from '../../actions/auth'

const Login = ({login}) => {
const [formData, setFormData] = useState(
    {
        email: '',

    }
);
    const {email, password} = formData;
    const onChange = e=>setFormData({...formData, [e.target.name]:e.target.value});

    const onSubmit = async e => {
        e.preventDefault();
        login(email, password)
        // console.log('Passwords dont match');

        // const newUser = {
        //     email,
        //     password
        // }
        // try {
        //     const config = {
        //         headers: {
        //             'Content-Type': 'application/json'
        //         }
        //     }
        //     const body = JSON.stringify(newUser);

        //     const res = await axios.post('/api/users', body, config);
        //     console.log(res.data);
        // } catch (error) {
        //     console.error(error.response.data)
        // }

    
    }

    return (
      <Fragment>
        <h1 className="large text-primary">Sign In</h1>
        <p className="lead">
          <i className="fas fa-user"></i> Sign In
        </p>
        <form className="form" onSubmit={e=> onSubmit(e)}>
          <div className="form-group">
            <input type="email" placeholder="Email Address" name="email" value={email} onChange={e=>onChange(e)}/>
            <small className="form-text">
              This site uses Gravatar so if you want a profile image, use a
              Gravatar email
            </small>
          </div>
          <div className="form-group">
            <input
              type="password"
              placeholder="Password"
              name="password"
              minLength="6"
              value={password} onChange={e=>onChange(e)}
              required
            />
          </div>
          <input type="submit" className="btn btn-primary" value="Login" />
        </form>
        <p className="my-1">
          Don't have an account? <Link to="/register">Sign Up</Link>
        </p>
      </Fragment>
    );
}

Login.propTypes = {
  login: PropTypes.func.isRequired,
}
export default connect(null, {login})(Login)
