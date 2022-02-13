import { Form, Formik, Field, ErrorMessage } from 'formik';
import { object, ref, string } from 'yup';
import { useAuth } from '../../context/auth';
import { useApi } from '../../api/restApi';
import { toast } from 'react-hot-toast';
import { Button, Theme, useTheme } from '@mui/material';
import { useMemo } from 'react';

const validationSchema = object({
    oldPassword: string().required('This field is required!'),
    newPassword: string().required('This field is required!'),
    repeatNewPassword: string().required('This field is required!').oneOf([ref('newPassword'), null], "Passwords don't match!"),
});

const initialValues = {
    oldPassword: '',
    newPassword: '',
    repeatNewPassword: '',
};

interface IPasswordChangeProps {
    onSuccess: () => void;
}

const PasswordChange: React.FC<IPasswordChangeProps> = ({onSuccess}) => {
    const { authState } = useAuth();
    const { authApi } = useApi();
    const theme = useTheme();
    const styles = useMemo(() => createStyles(theme), [theme]);

    const handleSubmit = async ({ oldPassword, newPassword }) => {
        if (authState) {
            const res = await authApi.changePassword(authState.userId, { oldPassword, newPassword });
            if(res.ok) {
                toast.success('Password successfully changed!');
                onSuccess();
            }
        }
    };

    return (
        <>
            <Formik
                onSubmit={handleSubmit}
                validationSchema={validationSchema}
                initialValues={initialValues}
            >
                {({ isValid }) => (
                    <Form>
                        <span style={styles.label}>Old Password</span>
                        <div>
                            <Field type='password' name='oldPassword' placeholder='Old Password' className='text-field' />
                            <ErrorMessage name='oldPassword' className='error-message' component="div" />
                        </div>
                        <span style={styles.label}>New Password</span>
                        <div>
                            <Field
                                name='newPassword'
                                type='password'
                                placeholder="New Password"
                                className='text-field'
                            />
                            <ErrorMessage name='newPassword' className='error-message' component="div" />
                        </div>
                        <span style={styles.label}>Repeat New Password</span>
                        <div>
                            <Field
                                name='repeatNewPassword'
                                type='password'
                                placeholder="New Password"
                                className='text-field'
                            />
                            <ErrorMessage name='repeatNewPassword' className='error-message' component="div" />
                        </div>
                        <Button style={styles.submitButton} color='secondary' variant="contained" type='submit' disabled={!isValid}>Change password</Button>
                    </Form>
                )}
            </Formik>
        </>
    );
};


const createStyles = (theme: Theme): { [key: string]: React.CSSProperties } => (
    {
        label: {
            textAlign: 'left',
            marginLeft: '10px',
            marginTop: '20px',
        },
        submitButton: {
            margin: '25px 0',
        }
    }
);

export default PasswordChange;
