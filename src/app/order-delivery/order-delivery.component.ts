import { Component, OnInit, OnDestroy, AfterContentInit, ElementRef } from '@angular/core';
import { Router } from '@angular/router';
import { ViewChild } from '@angular/core';
import * as d3 from 'd3';

import { AreaChartComponent } from './../area-chart/area-chart.component';
import { ChartControlsService } from '../chart-controls.service';

export class DeliveryMetric {
  state: string;
  stateDisplayValue: string;
  mean: number;
  stdDev: number;

  constructor(stateIn, stateDisplayValueIn, meanIn, stdDevIn) {
    this.state = stateIn;
    this.stateDisplayValue = stateDisplayValueIn;
    this.mean = meanIn;
    this.stdDev = stdDevIn;
  }
}


@Component({
  selector: 'app-order-delivery',
  templateUrl: './order-delivery.component.html',
  styleUrls: ['./order-delivery.component.scss']
})
export class OrderDeliveryComponent implements OnInit, OnDestroy, AfterContentInit {

  @ViewChild('areaChart', { static: true }) chart: AreaChartComponent;

  chartData = [];

  refreshInterval;

  deliveryMetrics: DeliveryMetric[];

  displayedColumns = ['legend', 'stateDisplayValue', 'mean', 'stdDev'];

  constructor(private router: Router, public chartControlsService: ChartControlsService) {
    this.chartControlsService.fullScreen = false;
   }

  ngOnInit() {
  }

  initialize() {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
    }
    this.generateData();
    this.chart.data = [...this.chartData];
    this.refreshInterval = setInterval(() => {
      if(document.hasFocus()) {
        this.generateData();
        this.chart.data = [...this.chartData];  
      }
    }, 1000);

  }

  ngOnDestroy() {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
    }
  }

  ngAfterContentInit() {
    this.initialize();
  }

  generateData() {
    this.chartData = [];
    this.deliveryMetrics = [];
    const meanPrepTime = randomInt(10, 11);
    const meanWaitTime = randomInt(8, 9);
    const meanTransitTime = randomInt(9, 10);

    const meanTotalTime = meanPrepTime + meanWaitTime + meanTransitTime;

    const sigmaPrepTime = randomInt(1, 1);
    const sigmaWaitTime = randomInt(2, 3);
    const sigmaTransitTime = randomInt(1, 2);

    const sigmaTotalTime = Math.floor(
      Math.sqrt(Math.pow(sigmaPrepTime, 2) +
        Math.pow(sigmaWaitTime, 2) +
        Math.pow(sigmaTransitTime, 2))
    );

    this.deliveryMetrics.push(new DeliveryMetric(
      'preparing',
      'Preparation',
      meanPrepTime,
      sigmaPrepTime
    ));
    this.deliveryMetrics.push(new DeliveryMetric(
      'ready',
      'Waiting',
      meanWaitTime,
      sigmaWaitTime
    ));
    this.deliveryMetrics.push(new DeliveryMetric(
      'inTransit',
      'In Transit',
      meanTransitTime,
      sigmaTransitTime
    ));
    this.deliveryMetrics.push(new DeliveryMetric(
      'delivered',
      'Total delivery',
      meanTotalTime,
      sigmaTotalTime
    ));

    let prandomizer = d3.randomNormal(meanPrepTime, sigmaPrepTime);
    let wrandomizer = d3.randomNormal(meanWaitTime, sigmaWaitTime);
    let trandomizer = d3.randomNormal(meanTransitTime, sigmaTransitTime);

    const ptimes = [];
    const wtimes = [];
    const ttimes = [];
    const totaltimes = [];
    for (let i = 0; i < 500; i++) {
      const p = Math.floor(prandomizer());
      const w = Math.floor(wrandomizer());
      const t = Math.floor(trandomizer());
      const total = p + w + t;
      ptimes.push(p);
      wtimes.push(w);
      ttimes.push(t);
      totaltimes.push(total);
    }
    this.chartData.push(ptimes);
    this.chartData.push(wtimes);
    this.chartData.push(ttimes);
    this.chartData.push(totaltimes);
  }

  navigateRight() {
    this.router.navigate(['/status']);
  }

  navigateLeft() {
    this.router.navigate(['/status']);
  }

  toggleData(event) {
    this.chartControlsService.showData = event.checked;
  }
}

export function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
