import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import PropTypes from 'prop-types';
import _ from 'lodash';
import axios from 'axios';
import * as actions from '../../redux/actions';
import { BackButton } from '../../components/Button';
import { Loading } from '../../components/Loading';
import { Error } from '../../components/Error';

import { Autocomplete, Card, Chip, TextField, Divider } from '@mui/material';
import BarChartExample from 'components/Chart/BarChartExample';
import BarChartBudget from 'components/Chart/BarChartBudget';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import PaymentsIcon from '@mui/icons-material/Payments';
import AssessmentIcon from '@mui/icons-material/Assessment';
import HourglassBottomIcon from '@mui/icons-material/HourglassBottom';

export default function ProjectDashboard({ title, subtitle }) {
  const dispatch = useDispatch();
  const projects = useSelector((state) => state.project);
  const budgets = useSelector((state) => state.budget);

  const [projectSelect, setProjectSelect] = useState();

  const budget = _?.sumBy(projectSelect?.budget, (e) => e?.cost);
  const estProfit = projectSelect?.cost - budget;
  const percen =
    (estProfit / (projectSelect?.cost === 0 ? 1 : projectSelect?.cost)) * 100;

  const BudgetFil = _?.filter(
    budgets?.rows,
    (e) => e?.project_id === projectSelect?.id,
  );

  useEffect(() => {
    dispatch(actions?.projectAll({}));
    dispatch(actions?.budgetAll({ project_id: projectSelect?.id }));
    return () => {};
  }, []);

  useEffect(() => {
    dispatch(actions?.budgetAll({ project_id: projectSelect?.id }));

    return () => {};
  }, [projectSelect]);

  const handleSelect = (data, index) => {
    const each = _.find(projects.rows, { _id: data?._id });
    setProjectSelect(each);
  };

  const renderSelect = () => (
    <div className="w-full px-1 py-1">
      <Autocomplete
        disablePortal
        id="free-solo-demo"
        freeSolo
        size="small"
        options={projects?.rows || []}
        getOptionLabel={(option) => `${option.project_number} | ${option.name}`}
        onChange={(e, newValue) => handleSelect(newValue)}
        renderInput={(params) => (
          <TextField {...params} size="small" label="Select Project" />
        )}
      />
    </div>
  );
  const renderBudgetChart = () => (
    <div>
      {projectSelect && (
        <div className="lg:flex">
          <div className=" lg:w-5/6 py-2">
            <Card>
              <BarChartBudget
                projectSelect={projectSelect}
                budgets={BudgetFil}
              />
            </Card>
          </div>
          <div className="w-full p-2">{renderCard()}</div>
        </div>
      )}
    </div>
  );

  const renderCard = () => (
    <div className="lg:grid grid-cols-2 gap-2 ">
      <div className="border-l-8  border-black">
        <Card sx={{ height: 120 }}>
          <div className="py-4">
            <div className="flex justify-between">
              <div className="p-4">
                <AccountBalanceWalletIcon sx={{ fontSize: 50 }} />
              </div>
              <div className="p-2  ">
                <div className="flex justify-end">Profit</div>
                <div
                  className={`${
                    projectSelect?.realprofit > 0
                      ? 'text-green-700'
                      : 'text-red-700'
                  } text-xl `}
                >
                  {' '}
                  {projectSelect?.realprofit
                    ?.toFixed(2)
                    ?.replace(/\d(?=(\d{3})+\.)/g, '$&,') || 0}{' '}
                </div>
                <div className="flex justify-end">
                  {projectSelect?.real_percentage?.toFixed(2)} %
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>
      <div className="border-l-8  border-black">
        <Card sx={{ height: 120 }}>
          <div className="py-4">
            <div className="flex justify-between">
              <div className="p-4">
                <PaymentsIcon sx={{ fontSize: 50 }} />
              </div>
              <div className="p-2  ">
                <div className="flex justify-end">Total Expenses</div>
                <div className="text-xl flex justify-end">
                  {projectSelect?.total_expenses
                    ?.toFixed(2)
                    ?.replace(/\d(?=(\d{3})+\.)/g, '$&,') || 0}{' '}
                </div>
                <div className="flex justify-end">
                  {projectSelect?.expenses_percentage?.toFixed(2)} %
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>
      <div className="border-l-8  border-black">
        <Card sx={{ height: 120 }}>
          <div className="py-4">
            <div className="flex justify-between">
              <div className="p-4">
                <AssessmentIcon sx={{ fontSize: 50 }} />
              </div>
              <div className="p-2  ">
                <div className="flex justify-end">Actual Spend</div>
                <div className="text-xl flex justify-end">wait...</div>
              </div>
            </div>
          </div>
        </Card>
      </div>
      <div className="border-l-8  border-black">
        <Card sx={{ height: 120 }}>
          <div className="py-4">
            <div className="flex justify-between">
              <div className="p-4">
                <HourglassBottomIcon sx={{ fontSize: 50 }} />
              </div>
              <div className="p-2  ">
                <div className="flex justify-end">Estimat Spend</div>
                <div className="text-xl flex justify-end">wait...</div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );

  const renderCardProject = () => (
    <div>
      <Card>
        <div className="p-1">
          <div className="grid lg:grid-cols-3 gap-3">
            <div className="">
              {renderSelect()}
              {projectSelect && (
                <div className="px-1 py-1">
                  <h1>Customer : {projectSelect?.customer} </h1>
                  <h1>Location : {projectSelect?.location} </h1>
                </div>
              )}
            </div>
            {projectSelect && (
              <div>
                <h1>
                  Purchase Order + Vat :{' '}
                  {projectSelect?.cost
                    ?.toFixed(2)
                    ?.replace(/\d(?=(\d{3})+\.)/g, '$&,')}{' '}
                </h1>
                <h1>
                  Budget :{' '}
                  {budget?.toFixed(2)?.replace(/\d(?=(\d{3})+\.)/g, '$&,')}{' '}
                </h1>
                <h1>
                  Estimate Profit :
                  {estProfit?.toFixed(2)?.replace(/\d(?=(\d{3})+\.)/g, '$&,')}{' '}
                </h1>
                <h1>Percent : {percen?.toFixed(2)}%</h1>
              </div>
            )}
            {projectSelect && (
              <div className="">
                <h1>Operation : </h1>
                <h1>
                  {' '}
                  PO Status :{' '}
                  {projectSelect?.po_status ? (
                    <Chip label="success" color="success" size="small" />
                  ) : (
                    <Chip label="waiting" color="error" size="small" />
                  )}{' '}
                </h1>
                <h1>
                  Delivery Order :
                  {projectSelect?.deliver_status ? (
                    <Chip label="success" color="success" size="small" />
                  ) : (
                    <Chip label="waiting" color="error" size="small" />
                  )}{' '}
                </h1>
                <h1>
                  Billing :{' '}
                  {projectSelect?.acc_status?.status ? (
                    <Chip label="success" color="success" size="small" />
                  ) : (
                    <Chip label="waiting" color="error" size="small" />
                  )}{' '}
                </h1>
                <h1>
                  Payment Complete :{' '}
                  {projectSelect?.payment_status?.status ? (
                    <Chip label="success" color="success" size="small" />
                  ) : (
                    <Chip label="waiting" color="error" size="small" />
                  )}{' '}
                </h1>
              </div>
            )}
          </div>
          {projectSelect && (
            <div className="px-1 py-1">
              <Divider sx={{ my: 2 }} />
              <h1 className="font-bold text-lg">VAT Details</h1>
              <h1>
                VAT (7%):{' '}
                {projectSelect?.cost
                  ? (projectSelect.cost * 0.07)
                      .toFixed(2)
                      .replace(/\d(?=(\d{3})+\.)/g, '$&,')
                  : '0.00'}
              </h1>
              <h1>
                Total (Including VAT):{' '}
                {projectSelect?.cost
                  ? (projectSelect.cost * 1.07)
                      .toFixed(2)
                      .replace(/\d(?=(\d{3})+\.)/g, '$&,')
                  : '0.00'}
              </h1>
            </div>
          )}
        </div>
      </Card>
    </div>
  );



  return (

    <div>
      <div className="flex flex-row justify-start pb-4"></div>
      <div>{renderCardProject()}</div>
      <div>{renderBudgetChart()}</div>
    </div>
  );
}
