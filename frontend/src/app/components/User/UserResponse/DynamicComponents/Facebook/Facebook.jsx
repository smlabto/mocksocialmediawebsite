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
import { updateUserMain } from '../../../../../actions/user';
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

  const fetchInfoDetails = async () => {
    try {
      //const ret = await getUserInfoDetails(data._id);
      //const obj = ret.data.infoDetails || null;
      //setResponseCode(ret.data.responseCode);
      // dispatch finish response event
      const utcDateTime = new Date();
      var utcDateTimeString = utcDateTime.toISOString().replace('Z', '').replace('T', ' ');
      await dispatch(updateUserMain({ finishedAt: utcDateTimeString }));
      //await setInfoDetails(obj);
      //setIsLoading(false);
    } catch (error) {
      //setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!isLoggedInUser) return <Navigate to="/" />;
    fetch();
    // window.onbeforeunload = function() {
    //   return WINDOW_GLOBAL.RELOAD_ALERT_MESSAGE;
    // };
  }, []);

  useEffect(() => {
    if (window.self !== window.top) {
    } else { 
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

  useEffect(() => {
    if (isEmbedded && timeRemaining <= 0) {
      setTimeout(() => {
        handleSubmit();
      }, 0);
    }
  }, [isEmbedded, timeRemaining]);
  
  const minutesRemaining = Math.floor(timeRemaining / 60);
  const secondsRemaining = timeRemaining % 60;

  const handleSubmit = (e) => {
    //e.preventDefault();
    fetchInfoDetails();
    dispatch(updateFlowActiveState());
  };

  return (
    <>
      {<div style={{ position: 'sticky', WebkitPosition: '-webkit-sticky', top: 0, width: '100%', zIndex: 1000, padding: '2px' }}>
        {isEmbedded && timeRemaining > 0 && (
          <p style={{ backgroundColor: 'yellow', fontSize: '70%' }}>You have <b>{minutesRemaining} min{minutesRemaining !== 1 && 's'}</b> and <b>{secondsRemaining} sec{secondsRemaining !== 1 && 's'}</b> left to browse and engage with posts below (e.g., like, share, comment). After 10 minutes, go back to the survey page to complete the survey.</p>
        )}
        {isEmbedded && timeRemaining <= 0 && (
          <p style={{ backgroundColor: 'lightgreen' }}>The 10 minutes are up. Please go back to the survey page and complete the remaining questions.</p>
        )}
      </div>}
      <Container component="main" maxWidth="sm" className="facebookCard">
        <StoryCreate />
        <div className="facebookMainBody">
          {totalPostCount && totalPostCount > 0 ?
            <Feed omitInteractionBar={data?.omitInteractionBar || false}/>
          : <p>Posts are loading... If no posts appear within ~30secs, please try accessing the survey using a different browser.</p>}
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
