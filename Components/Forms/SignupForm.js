import Link from 'next/link';


const SignupForm = (props) => {

    const { formField, handleInputFieldChange, handleFormSubmit } = props;

    return (
        <form onSubmit={handleFormSubmit}>
            <input
                className='form_input_field'
                type="text"
                name="username"
                placeholder="Username"
                value={formField.username}
                onChange={handleInputFieldChange}
            />
            <input
                className='form_input_field'
                type="text"
                name="email"
                placeholder="Email Address"
                value={formField.email}
                onChange={handleInputFieldChange}
            />
            <input
                className='form_input_field'
                type="password"
                name="password"
                placeholder="Password"
                value={formField.password}
                onChange={handleInputFieldChange}
            />
            <input
                className='form_input_field'
                type="password"
                name="passwordConfirmation"
                placeholder="Password Confirmation"
                value={formField.passwordConfirmation}
                onChange={handleInputFieldChange}
            />
            <button className="form_btn">Create Account</button>
            <div className="form_having_account">
                Already having Account ?
                <Link href='/Login'>Signin</Link>
            </div>
        </form>
    )
}

export default SignupForm;