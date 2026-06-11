import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid'; // a plugin!
import { Card } from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import * as actions from '../../redux/actions';
import { useHistory } from 'react-router-dom/cjs/react-router-dom.min';
import React, { useState, useEffect } from 'react';
import { DateTime } from 'luxon';

export default function Calendar() {
  const history = useHistory();
  const dispatch = useDispatch();
  const projects = useSelector((state) => state.project);
  useEffect(() => {
    dispatch(actions.projectAll({}));

    return () => {};
  }, []);

  const formatEventTime = (isoDate) =>
    DateTime.fromISO(isoDate).set({ hour: 12, minute: 1 }).toISODate();

  const formatEventEndTime = (isoDate) =>
    DateTime.fromISO(isoDate).set({ hour: 24, minute: 1 }).toISODate();

  const getRandomColor = () => {
    const colors = ['#B0E0E6', '#87CEFA', '#BEBEBE', '#66CDAA', '#8FBC8F'];
    return colors[Math.floor(Math.random() * colors.length)];
  };

  const getEvent = _.map(projects.rows, (eachWork) => {
    const events = {
      id: eachWork?._id,
      // title: `${eachWork?.time || ''} ${eachWork?.name}  `,
      title: ` ${eachWork?.name}`,
      start: formatEventTime(eachWork?.date_start),
      end: formatEventEndTime(eachWork?.date_end),
      allDay: true,
      backgroundColor: getRandomColor(),
      borderColor: '#FFFFFF',
      textColor: '#000000',
    };
    return events;
  });
  const eventRender = (info) => {
    info.el.style.fontSize = '12px'; // set font size to 12px
  };

  return (
    <div>
      <Card>
        <div className="p-2">
          <FullCalendar
            plugins={[dayGridPlugin]}
            initialView="dayGridMonth"
            events={getEvent}
            eventRender={eventRender}
            height="100vh"
            width="100vw"
          />
        </div>
      </Card>
    </div>
  );
}
