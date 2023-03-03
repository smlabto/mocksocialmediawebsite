import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import useStyles from '../../../../style';
import Feed from './Feed/Feed';
import { Navigate } from 'react-router-dom';
import "./Facebook.css";
import {
  getFacebookPostsCount,
  clearFacebookState
} from '../../../../../actions/socialMedia';
import { updateFlowActiveState } from '../../../../../actions/flowState';
import { Button, Container } from '@material-ui/core';
import StoryCreate from "./Feed/StoryCreate/StoryCreate";
import { IconChevronRight } from '@tabler/icons-react';
import { WINDOW_GLOBAL } from '../../../../../constants';

const Facebook = ({ data }) => {
  const { isLoggedInUser, translations, languageName } = useSelector(state => state.userAuth);
  const totalPostCount = useSelector(state => state.socialMedia.totalPostCount);

  const dispatch = useDispatch();
  const classes = useStyles();

  //add timer counter
  const [isEmbedded, setIsEmbedded] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(10 * 60);

  const fetch = async () => {
    dispatch(clearFacebookState());
    // fetch all facebook Ids and their counts
    const getRequest = {
      templateId: data.templateId,
      pageId: data._id,
      platform: data.type,
      order: data.pageDataOrder,
      language: languageName,
    }
    dispatch(getFacebookPostsCount(getRequest));
  };

  useEffect(() => {
    if (!isLoggedInUser) return <Navigate to="/" />;
    fetch();
    window.onbeforeunload = function() {
      return WINDOW_GLOBAL.RELOAD_ALERT_MESSAGE;
    };
  }, []);

  useEffect(() => {
    if (window.self !== window.top) {
      //const message = document.createElement('p');
      //message.innerText = 'This app is running inside an iframe.';
      //document.body.appendChild(message);
    } else { 
      //const message = document.createElement('div');
      //message.className="storyCreateTop";
      //message.innerText = 'Please spend the next 10 minutes browsing and interacting with the Facebook posts above as if you were on Facebook (e.g., liking, sharing, commenting, etc.) Once the 10 minutes is up, return to the survey page and complete the rest of the survey.';
      //document.body.appendChild(message);
      setIsEmbedded(true);
    }
  }, []);


  useEffect(() => {
    let intervalId;
    if (isEmbedded && timeRemaining > 0) {
      intervalId = setInterval(() => {
        setTimeRemaining(prevTime => prevTime - 1);
      }, 1000);
    }
    return () => clearInterval(intervalId);
  }, [isEmbedded, timeRemaining]);

  const minutesRemaining = Math.floor(timeRemaining / 60);
  const secondsRemaining = timeRemaining % 60;


  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(updateFlowActiveState());
  };

  return (
    <>
      <Container component="main" maxWidth="sm" className="facebookCard">
        <StoryCreate />

        {<div style={{ position: 'sticky', position: '-webkit-sticky', top: 0, width: '100%', backgroundColor: 'yellow', zIndex: 1000, padding: '4px' }}>
          {isEmbedded && timeRemaining > 0 && (
            <p style={{ backgroundColor: 'yellow' }}>You have <b>{minutesRemaining} minute{minutesRemaining !== 1 && 's'}</b> and <b>{secondsRemaining} second{secondsRemaining !== 1 && 's'}</b> left to browse and interact with the Facebook posts below as if you were on Facebook (e.g., liking, sharing, commenting, etc.) Once the 10 minutes is up, return to the survey page and complete the rest of the survey.</p>
          )}
          {isEmbedded && timeRemaining <= 0 && (
            <p style={{ backgroundColor: 'lightgreen' }}>The 10 minutes is up, please return to the survey page and complete the rest of the survey.</p>
          )}
        </div>}

        <div className="facebookMainBody">
          {totalPostCount && totalPostCount > 0 ?
            <Feed omitInteractionBar={data?.omitInteractionBar || false}/>
          : <p>No Posts Exists!</p>}
        </div>

        {/* <div className="fbNextBotton">
          <Button
            type="submit"
            variant="contained"
            color="primary"
            style={{ marginTop: '12px' }}
            onClick={handleSubmit}
            className={classes.submit}
            endIcon={<IconChevronRight />}
          >
            {translations?.next || "NEXT"}
          </Button>
        </div> */}
      </Container>
    </>
  )
};

export default Facebook;
