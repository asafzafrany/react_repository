import React, {Fragment, useEffect, useRef, useState} from "react";
import {Box} from "@material-ui/core";
import {makeStyles} from "@material-ui/core/styles";
import moment from "moment";
import {TIMELINE_TIME_FORMAT} from "../../constants";
import {getDurationInMin} from "./utils";

const useStyles = makeStyles((theme) => ({
    timeline: {
        height: "4px",
        backgroundColor: "#ccc",
    },
    timelineProgress: {
        height: "100%",
    },
    timelineItems: {
        marginTop: "-7px",
        display: "flex",
    },
    sourceNameLabel: {
        position: "absolute",
        marginTop: "-7px",
        fontSize: "12px",
        fontWeight: "bold",
    },
}));
const SourceTimeline = ({
                            index, sourceAndSiteName, color, startTime, endTime, logsCurrentTimestamp, resolutionPx,
                            loadedBundleDurationMinutes, loadedSourcesStartTime, isMaxMarginIfBigger
                        }) => {

    const classes = useStyles();

    const [xAxisOffsetPx, setXAxisOffsetPx] = useState(null);
    const [progressBarWidthPx, setProgressBarWidthPx] = useState(0);
    const [timelineRelativeWidthPx, setTimelineRelativeWidthPx] = useState(null);
    const [sourceNameLabelMarginLeft, setSourceNameLabelMarginLeft] = useState(0);
    const sourceNameLabelRef = useRef(null);

    useEffect(() => {
        if (logsCurrentTimestamp && loadedBundleDurationMinutes && timelineRelativeWidthPx && xAxisOffsetPx !== null) {
            const durationFromBundleStart = Math.ceil(getDurationInMin(moment(loadedSourcesStartTime.split('T').join(' ')).format(TIMELINE_TIME_FORMAT),
                moment(logsCurrentTimestamp.split('T').join(' ')).format(TIMELINE_TIME_FORMAT)));

            const bundleTimelineProgressPx = (durationFromBundleStart / loadedBundleDurationMinutes) * resolutionPx;

            if (Math.ceil(xAxisOffsetPx + timelineRelativeWidthPx) <= bundleTimelineProgressPx) {
                setProgressBarWidthPx(timelineRelativeWidthPx);
            } else {
                setProgressBarWidthPx(bundleTimelineProgressPx > xAxisOffsetPx ? bundleTimelineProgressPx - xAxisOffsetPx : 0);
            }
        }
    }, [logsCurrentTimestamp, loadedBundleDurationMinutes, xAxisOffsetPx, timelineRelativeWidthPx]);

    useEffect(() => {
        if (loadedBundleDurationMinutes) {
            const formattedStartTime = moment(startTime.split('T').join(' ')).format(TIMELINE_TIME_FORMAT);

            const timelineDurationOffset = getDurationInMin(
                moment(loadedSourcesStartTime.split('T').join(' ')).format(TIMELINE_TIME_FORMAT), formattedStartTime);

            setXAxisOffsetPx((timelineDurationOffset / loadedBundleDurationMinutes) * resolutionPx);

            const sourceTimeLineDuration = getDurationInMin(formattedStartTime, moment(endTime.split('T').join(' ')).format(TIMELINE_TIME_FORMAT));
            setTimelineRelativeWidthPx((sourceTimeLineDuration / loadedBundleDurationMinutes) * resolutionPx);
        }
    }, [loadedBundleDurationMinutes]);

    useEffect(() => {
        if (xAxisOffsetPx !== null) {
            const labelWidth = sourceNameLabelRef.current.clientWidth;
            const marginLeft = xAxisOffsetPx - labelWidth - 5;
            setSourceNameLabelMarginLeft(marginLeft);

            if (marginLeft < 0){
                isMaxMarginIfBigger((-1) * marginLeft, sourceAndSiteName);
            }
        }
    }, [xAxisOffsetPx]);

    return (
        <Fragment>
            <label ref={sourceNameLabelRef} className={classes.sourceNameLabel}
                   style={{marginLeft: `${sourceNameLabelMarginLeft}px`}}>{sourceAndSiteName}</label>
            <Box className={classes.timeline} style={resolutionPx ? {
                width: `${timelineRelativeWidthPx}px`,
                marginLeft: `${xAxisOffsetPx}px`
            } : null}>
                <Box className={classes.timelineProgress}
                     style={{
                         width: `${progressBarWidthPx}px`,
                         backgroundColor: color ? color : "black",
                     }}/>
            </Box>
        </Fragment>
    )
};
export default SourceTimeline;