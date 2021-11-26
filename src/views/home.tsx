import React from 'react';
import { useHistory } from 'react-router-dom';

const Home = () => {
    const history = useHistory();
    //const from = location?.state?.from || { pathname: '/' };

    const displayPage = (filename: string) => {
        console.log(filename);
        history.push({
            pathname: '/page',
            state: filename,
        });
    }

    return (
        <div onClick={() => displayPage('/images/voy.jpeg')}>
            <img src={'/images/voy.jpeg'} alt={'voynich'} width={200} />
        </div>
    );
};

export default Home;
