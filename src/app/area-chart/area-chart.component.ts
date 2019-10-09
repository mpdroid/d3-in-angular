import { Component, OnInit, ElementRef, ViewEncapsulation, Input, SimpleChanges, OnChanges } from '@angular/core';

import * as d3 from 'd3';

export class AreaDatum {
    x: number;
    y: number;
}

@Component({
    selector: 'app-area-chart',
    encapsulation: ViewEncapsulation.None,
    templateUrl: './area-chart.component.html',
    styleUrls: ['./area-chart.component.scss']
})
export class AreaChartComponent implements OnInit, OnChanges {

    @Input() data: number[];
    hostElement; // Native element hosting the SVG container
    svg; // Top level SVG element
    g; // SVG Group element
    colorScale; // D3 color provider
    x; // X-axis graphical coordinates
    y; // Y-axis graphical coordinates
    colors = d3.scaleOrdinal(d3.schemeCategory10);
    bins; // Array of frequency distributions - one for each area chaer
    paths; // Path elements for each area chart
    area; // For D3 area function
    histogram; // For D3 histogram function

    constructor(private elRef: ElementRef) {
        this.hostElement = this.elRef.nativeElement;
    }

    ngOnInit() {
    }

    ngOnChanges(changes: SimpleChanges) {
        if (changes.data) {
            this.updateChart(changes.data.currentValue);
        }
    }

    private createChart(data: number[]) {

        this.removeExistingChartFromParent();

        this.setChartDimensions();

        this.setColorScale();

        this.addGraphicsElement();

        this.createXAxis();

        this.createYAxis();

        // d3 area and histogram functions  has to be declared after x and y functions are defined
        this.area = d3.area()
            .x((datum: any) => this.x(datum.x0))
            .y0(this.y(0))
            .y((datum: any) => this.y(datum.x1));

        this.histogram = d3.histogram()
            .value((datum) => datum)
            .domain([0, 45])
            .thresholds(this.x.ticks(60));

        // data has to be processed after area and histogram functions are defined
        this.processData(data);

        this.createAreaCharts();

    }

    private processData(data) {
        this.bins = [];
        data.forEach((row) => {
            this.bins.push(this.histogram(row))
        });
    }

    private setChartDimensions() {
        let viewBoxHeight = 100;
        let viewBoxWidth = 200;
        this.svg = d3.select(this.hostElement).append('svg')
            .attr('width', '100%')
            .attr('height', '100%')
            .attr('viewBox', '0 0 ' + viewBoxWidth + ' ' + viewBoxHeight);
    }

    private addGraphicsElement() {
        this.g = this.svg.append("g")
            .attr("transform", "translate(0,0)");
    }

    private setColorScale() {
        this.colorScale = d3.scaleOrdinal(d3.schemeCategory10);
        // Below is an example of using custom colors
        // this.colorScale = d3.scaleOrdinal().domain([0,1,2,3]).range(['#1f77b4', '#ff7f0e', '#2ca02c', '#d62728']);
    }

    private createXAxis() {
        this.x = d3.scaleLinear()
            .domain([0, 45])
            .range([30, 170]);
        this.g.append('g')
            .attr('transform', 'translate(0,90)')
            .attr("stroke-width", 0.5)
            .call(d3.axisBottom(this.x).tickSize(0).tickFormat(''));

        this.g.append('g')
            .attr('transform', 'translate(0,90)')
            .style('font-size', '6')
            .style("stroke-dasharray", ("1,1"))
            .attr("stroke-width", 0.1)
            .call(d3.axisBottom(this.x).ticks(10).tickSize(-80));

        //       this.g.append('text')
        //            .attr('text-anchor', 'middle')
        //            .attr('transform', 'translate(100,6)')
        //            .style('font-size', 8)
        //            .text('Delivery Time in Minutes');
    }

    private createYAxis() {
        this.y = d3.scaleLinear()
            .domain([0, 200])
            .range([90, 10]);
        this.g.append('g')
            .attr('transform', 'translate(30,0)')
            .attr("stroke-width", 0.5)
            .call(d3.axisLeft(this.y).tickSize(0).tickFormat(''));
        this.g.append('g')
            .attr('transform', 'translate(30,0)')
            .style("stroke-dasharray", ("1,1"))
            .attr("stroke-width", 0.1)
            .call(d3.axisLeft(this.y).ticks(4).tickSize(-140))
            .style('font-size', '6');

        this.g.append('text')
            .attr('text-anchor', 'middle')
            .attr('transform', 'translate(10,50) rotate(-90)')
            .style('font-size', 8)
            .text('Frequency');
    }

    private createAreaCharts() {
        this.paths = [];
        this.bins.forEach((row, index) => {
            this.paths.push(this.g.append('path')
                .datum(row)
                .attr('fill', this.colorScale('' + index))
                .attr("stroke-width", 0.1)
                .attr('opacity', 0.5)
                .attr('d', d3.area()
                    .x((datum) => this.x(d3.mean([datum.x1, datum.x2])))
                    .y0(this.y(0))
                    .y1((datum) => this.y(datum.length))));
        });
    }

    public updateChart(data: number[]) {
        if (!this.svg) {
            this.createChart(data);
            return;
        }

        this.processData(data);

        this.updateAreaCharts();

    }

    private updateAreaCharts() {
        this.paths.forEach((path, index) => {
            path.datum(this.bins[index])
                .transition().duration(1000)
                .attr('d', d3.area()
                    .x((datum) => this.x(d3.mean([datum.x1, datum.x2])))
                    .y0(this.y(0))
                    .y1((datum) => this.y(datum.length)));

        });
    }

    private removeExistingChartFromParent() {
        // !!!!Caution!!!
        // Make sure not to do;
        //     d3.select('svg').remove();
        // That will clear all other SVG elements in the DOM
        d3.select(this.hostElement).select('svg').remove();
    }
}

