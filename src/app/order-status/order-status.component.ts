import { Component, OnInit, OnDestroy, AfterContentInit, ElementRef } from '@angular/core';

import { ViewChild } from '@angular/core';

import { DonutChartComponent, DonutChartDatum } from './../donut-chart/donut-chart.component';


import * as HOBBITON from './hobbiton.json';

export class OrderState {
    state: string;
    stateDisplayValue: string;
    count: number;
}

export class OrderStatesInCity {
    city: string;
    orderStates: OrderState[]
}


@Component({
  selector: 'app-order-status',
  templateUrl: './order-status.component.html',
  styleUrls: ['./order-status.component.scss']
})
export class OrderStatusComponent implements OnInit, OnDestroy, AfterContentInit {

  @ViewChild('ordersByStatusChart', {static: true}) chart: DonutChartComponent;

  hobbiton = <OrderStatesInCity>HOBBITON;

  cities = ['Arlington Heights', 'Buffalo Grove', 'Chicago', 'Deerfield', 'Elgin'];

  selected = this.cities[0];

  orderStatesByCity: OrderStatesInCity[] = [];

  orderStatesInCurrentCity: OrderState[];

  chartData: Map<string, number> ;

  chartLabels: Map<string, string> ;

  displayedColumns = ['legend', 'orderStatus', 'total'];


  refreshInterval;

  constructor() { }

  ngOnInit() {
  }

  initialize() {
    if (this.refreshInterval) {
        clearInterval(this.refreshInterval);
    }
    this.generateData();
    this.setChartDataAndLabels();
    this.chart.updateChart(this.chartData);
    this.refreshInterval = setInterval(() => {
        this.updateStates();
        this.setChartDataAndLabels();
        this.chart.updateChart(this.chartData);
    }, 5000);

  }

  ngOnDestroy() {
  }

  ngAfterContentInit() {
      this.initialize();
  }

  onSelect(event) {
      this.initialize();
  }

  generateData(){
        this.cities.forEach((city) => {
            const osic = new OrderStatesInCity();
            Object.assign(HOBBITON, osic);
            osic.city = city;
            osic.orderStates = [];
            HOBBITON.orderStates.forEach((state) => {
                const target = new OrderState();
                target.state = state.state;
                target.stateDisplayValue = state.stateDisplayValue;
                target.count = randomInt(0, 100);
                osic.orderStates.push(target);
            });
            this.orderStatesByCity.push(osic);
        });
    }

    setChartDataAndLabels() {
        this.chartData = new Map<string, number> ();
        this.chartLabels = new Map<string, string> ();
        this.orderStatesInCurrentCity = this.orderStatesByCity
            .filter((osic) => osic.city === this.selected)[0]
            .orderStates;

        this.orderStatesInCurrentCity.forEach((state) => {
                    this.chartData.set(state.state , state.count);
                    this.chartLabels.set(state.state , state.stateDisplayValue);
            });
  }

  updateStates() {
          const increment = (val, plus, minus) => {
            return val + plus - minus;
          }
          const newOrders = randomInt(0,10);
          const newReady = randomInt(0,Math.min(10,this.orderStatesInCurrentCity[0].count));
          const newTransit = randomInt(0,Math.min(10, this.orderStatesInCurrentCity[1].count));
          const newDelivered = randomInt(0,Math.min(10, this.orderStatesInCurrentCity[2].count));
          this.orderStatesInCurrentCity[0].count = increment(this.orderStatesInCurrentCity[0].count, newOrders, newReady);
          this.orderStatesInCurrentCity[1].count = increment(this.orderStatesInCurrentCity[1].count, newReady, newTransit);
          this.orderStatesInCurrentCity[2].count = increment(this.orderStatesInCurrentCity[2].count, newTransit, newDelivered);
          this.orderStatesInCurrentCity[3].count = increment(this.orderStatesInCurrentCity[3].count, newDelivered, 0);
  }
}

export function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
