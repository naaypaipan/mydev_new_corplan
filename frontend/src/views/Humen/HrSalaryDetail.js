import React from 'react';

import { useDispatch, useSelector } from 'react-redux';
import * as actions from '../../redux/actions';
import { useParams } from 'react-router-dom/cjs/react-router-dom.min';
import { useEffect, useState } from 'react';
import SalaryListDetailCard from '../../components/Card/SalaryListDetailCard';
import SalaryDetail from '../../components/Table/SalaryDetail';
import { payrollReport } from '../../components/PDF';
import TimestampProjectCost from '../../components/Table/TimestampProjectCost';
import { Card, CardContent, Grid, Typography } from '@mui/material';

export default function HrSalaryDetail({ title, subtitle }) {
  const dispatch = useDispatch();
  const { id } = useParams();
  const salaryList = useSelector((state) => state.salaryList);


  useEffect(() => {
    dispatch(actions.salaryListGet(id));
  }, []);

  const renderDetail = () => (
    <SalaryListDetailCard salary={salaryList} payrollReport={payrollReport} />
  );
  const renderTable = () => <SalaryDetail salary={salaryList?.salaryData} />;
  const renderDashboard = () => (
    <TimestampProjectCost timestamp={{ dashboard: salaryList?.dashboard }} />
  );

  const renderSummary = () => {
    const formatCurrency = (amount) => {
      return new Intl.NumberFormat('th-TH', {
        style: 'currency',
        currency: 'THB',
        minimumFractionDigits: 2,
      }).format(amount || 0);
    };

    return (
      <div className="py-2">
        <Card>
          <CardContent>
            <Grid container spacing={2}>
              <Grid item xs={12} md={3}>
                <Typography variant="subtitle1" color="textSecondary">
                  ยอดจ่ายสุทธิ (Total Net)
                </Typography>
                <Typography variant="h5" color="primary">
                  {formatCurrency(salaryList?.total)}
                </Typography>
              </Grid>
              <Grid item xs={12} md={3}>
                <Typography variant="subtitle1" color="textSecondary">
                  ภาษีหัก ณ ที่จ่าย (Total Tax)
                </Typography>
                <Typography variant="h5" color="error">
                  {formatCurrency(salaryList?.total_tax)}
                </Typography>
              </Grid>
              <Grid item xs={12} md={3}>
                <Typography variant="subtitle1" color="textSecondary">
                  ประกันสังคม (Total SSO)
                </Typography>
                <Typography variant="h5" color="error">
                  {formatCurrency(salaryList?.total_sso)}
                </Typography>
              </Grid>
              <Grid item xs={12} md={3}>
                <Typography variant="subtitle1" color="textSecondary">
                  หักมาสาย (Total Late)
                </Typography>
                <Typography variant="h5" color="error">
                  {formatCurrency(salaryList?.total_late)}
                </Typography>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </div>
    );
  };

  return (
    <div>
      {renderDetail()}
      {renderSummary()}
      {renderTable()}
      {renderDashboard()}
    </div>
  );
}
