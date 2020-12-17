import React, {Fragment, useEffect, useState} from "react";
import {Box} from "@material-ui/core";
import {makeStyles} from "@material-ui/core/styles";
import {convertStringToHash, intToRGB} from "../LogsGrid/gridUtils";
import SourceTimeline from "./SourceTimeline";
import BundleTimeline from "./BundleTimeline";
import moment from "moment";
import {getSiteNameWithoutDate} from "./utils";
import CloseIcon from "@material-ui/icons/Close";
import IconButton from "@material-ui/core/IconButton";

const useStyles = makeStyles((theme) => ({
    root: {
        width: "100%",
        marginTop: "25px",
        // marginLeft: "50px",
    },
    bundleTimelineBox: {
        margin: "15px 35px 15px 25px"
    },
    sourcesTimelinesBox: {
        margin: "15px 35px 15px 25px"
    },
    sourceTimelineBox: {
        margin: "15px 0 15px 0"
    },
    closeButton: {
        position: 'absolute',
        right: "3px",
        top: "3px",
        color: theme.palette.grey[500],
    }
}));

const AdvancedTimeline = ({bundleData, sourcesData, resolutionPx, logsCurrentTimestamp, onTimeFilterSubmitted,
                              setAdvancedTimeLineMenuWidthAdditionPx, handleClose}) => {
    const classes = useStyles();

    const [loadedBundleDurationMinutes, setLoadedBundleDurationMinutes] = useState(0);
    const [maxMarginLeft, setMaxMarginLeft] = useState(0);

    const onCloseClicked = () => {
        handleClose();
    };

    const isMaxMarginIfBigger = (marginLeft) => {
        if (marginLeft > maxMarginLeft) {
            setMaxMarginLeft(marginLeft);
            setAdvancedTimeLineMenuWidthAdditionPx(marginLeft);
        }
    };

    function getSourcesTimelines() {
        return sourcesData.map((source, index) => {
            const sourceTitle = source.SiteName + " - " + source.SourceName;
            const sourceAndSiteName = getSiteNameWithoutDate(source.SiteName) + "_" + source.SourceName;

            return (
                <Box className={classes.sourceTimelineBox}>
                    <SourceTimeline
                        index={index}
                        sourceAndSiteName={sourceAndSiteName}
                        color={"#" + intToRGB(convertStringToHash(sourceTitle))}
                        startTime={source.FirstLogLineTimeStamp}
                        endTime={source.LastLogLineTimeStamp}
                        logsCurrentTimestamp={logsCurrentTimestamp}
                        resolutionPx={resolutionPx}
                        loadedBundleDurationMinutes={loadedBundleDurationMinutes}
                        loadedSourcesStartTime={bundleData.startTime}
                        isMaxMarginIfBigger={isMaxMarginIfBigger}
                    />
                </Box>
            );
        });
    }

    useEffect(() => {
        if (bundleData && bundleData.startTime && bundleData.endTime) {
            const startTimeMoment = moment(bundleData.startTime.split('T').join(' '));
            const endTimeMoment = moment(bundleData.endTime.split('T').join(' '));
            let duration = moment.duration(endTimeMoment.diff(startTimeMoment));
            let minutes = duration.asMinutes();
            setLoadedBundleDurationMinutes(minutes);
        }
    }, [bundleData]);

    return (
        <Fragment>
                <IconButton size="small" className={classes.closeButton} onClick={onCloseClicked}>
                <CloseIcon/>
            </IconButton>
            <Box className={classes.root} style={{marginLeft: `${maxMarginLeft + 5}px`}}>
                <Box className={classes.sourcesTimelinesBox}>
                    {getSourcesTimelines()}
                </Box>
                <Box className={classes.bundleTimelineBox}>
                    <BundleTimeline
                        isArrowTop={false}
                        resolutionPx={resolutionPx}
                        startTime={bundleData.startTime}
                        endTime={bundleData.endTime}
                        logsCurrentTimestamp={logsCurrentTimestamp}
                        sourcesData={sourcesData}
                        onTimeFilterSubmitted={onTimeFilterSubmitted}
                    />
                </Box>
            </Box>
        </Fragment>
    )
};
export default AdvancedTimeline;