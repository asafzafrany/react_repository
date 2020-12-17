import React, {Fragment, useContext, useEffect, useState} from "react";
import {Box} from "@material-ui/core";
import {makeStyles} from "@material-ui/core/styles";
import clsx from "clsx";
import {appBarBgColor} from "../../theme";
import moment from "moment";
import {NORMALIZED_TIME_FORMAT, TIMELINE_TIME_FORMAT, TIMELINE_WIDTH_BETWEEN_ITEMS} from "../../constants";
import {LoadedBundleContext} from "../../context/LoadedBundleContext";
import {generateTimestampValues, getDurationInMin, timelineSorter} from "./utils";
import Tooltip from "@material-ui/core/Tooltip";
import {TimeFilterContext} from "../../context/TimeFilterContext";
import {LogsGridContext} from "../../context/LogsGridContext";

const useStyles = makeStyles((theme) => ({
    timeline: {
        width: "100%",
        height: "4px",
        backgroundColor: "#ccc",
        marginBottom: "40px",
    },
    timelineProgress: {
        height: "100%",
    },
    timelineItems: {
        marginTop: "-7px",
        display: "flex",
    },
    arrowBoxTop: {
        width: "102%",
        marginTop: "-30px",
        display: "flex",
    },
    arrowBoxBottom: {
        width: "102%",
        marginTop: "5px",
        display: "flex",
    },
    timelineContent: {
        position: "absolute",
        top: "10px",
        width: "75px",
        transform: "translateX(-50%)",
        textAlign: "center",
        fontSize: "12px",
        cursor: "pointer",
    },
}));
const BundleTimeline = ({
                            isArrowVisible = true, color = appBarBgColor, sourcesData, startTime, endTime,
                            isClickable = true, resolutionPx, logsCurrentTimestamp, isArrowTop = true, onTimeFilterSubmitted = null
                        }) => {

    const [progressBarWidthPx, setProgressBarWidthPx] = useState(0);


    const useStylesDynamic = makeStyles((theme) => ({
        timelineItem: {
            height: "15px",
            cursor: "pointer",

            '&::before': {
                content: "''",
                width: "3px",
                height: "10px",
                backgroundColor: "#ccc",
                display: "block",

                cursor: "pointer",
                pointerEvents: isClickable ? "all" : "none",
            },
        },
        active: {
            '&::before': {
                backgroundColor: color
            }
        },
        timelineArrowTop: {
            display: "block",
            top: "-25px",
            marginLeft: `${-3.3 + (progressBarWidthPx ? progressBarWidthPx : 0)}px`,
            background: "#7f8c8d",
            width: "10px",
            height: "10px",
            transform: "rotate(-45deg)",

            '&::before': {
                content: "''",
                width: "10px",
                height: "10px",
                display: "block",
                position: "absolute",
                backgroundColor: "#7f8c8d",
                top: "-7px",
                marginLeft: "7px",
                transform: "rotate(-45deg) translateX(-50%)",
            }
        },
        timelineArrowBottom: {
            position: "relative",
            top: "-7px",
            marginLeft: `${-4.3 + (progressBarWidthPx ? progressBarWidthPx : 0)}px`,
            background: "#7f8c8d",
            width: "10px",
            height: "10px",
            transform: "rotate(-45deg)",

            '&::before': {
                content: "''",
                width: "10px",
                height: "10px",
                display: "block",
                position: "absolute",
                backgroundColor: "#7f8c8d",
                top: "0px",
                marginLeft: "0px",
                transform: "rotate(-45deg) translateX(-50%)",
            }
        }
    }));

    const classes = useStyles();
    const dynamicClasses = useStylesDynamic();

    const loadedBundleContext = useContext(LoadedBundleContext);
    const timeFilterContext = useContext(TimeFilterContext);
    const logsGridContext = useContext(LogsGridContext);

    const [xAxisItems, setXAxisItems] = useState([]);

    const timelineItemClicked = (itemIndex) => {
        const normalizedTime = moment(xAxisItems[itemIndex]).format(NORMALIZED_TIME_FORMAT);

        timeFilterContext.setStartTime(normalizedTime);
        logsGridContext.setRunExternalTimeFilterSubmitted({
            action: "submitExternalTimeFilter"
        });
    };

    const getItemRenderer = (item, i) => {
        let itemWidthPx = "0px";
        if (i !== xAxisItems.length - 1 && loadedBundleContext.loadedBundleDurationMinutes) {
            const itemDuration = getDurationInMin(item, xAxisItems[i + 1]);
            itemWidthPx = `${(itemDuration / loadedBundleContext.loadedBundleDurationMinutes) * resolutionPx}px`
        }

        const startToItemDuration = getDurationInMin(xAxisItems[0], item);
        const isActive = (progressBarWidthPx >= (startToItemDuration / loadedBundleContext.loadedBundleDurationMinutes) * resolutionPx);
        const itemRenderer = (
            <div>
                <Box key={i}
                     id={moment(item).format(NORMALIZED_TIME_FORMAT)}
                     className={clsx(dynamicClasses.timelineItem, isActive ? dynamicClasses.active : null)}
                     onClick={() => timelineItemClicked(i)}
                     style={{
                         width: itemWidthPx,
                         position: (i === 0 || i === xAxisItems.length - 1) ? "relative" : ""
                     }}
                >
                    {(i === 0 || i === xAxisItems.length - 1) &&
                    <Box className={classes.timelineContent}>
                        {item}
                    </Box>
                    }
                </Box>
            </div>
        );

        if ((i === 0 || i === xAxisItems.length - 1)) {
            return itemRenderer;
        } else {
            return (
                <Tooltip title={item}>
                    {itemRenderer}
                </Tooltip>
            )
        }
    };

    const generateXAxisItems = () => {
        const maxNumOfItems = Math.ceil(resolutionPx / TIMELINE_WIDTH_BETWEEN_ITEMS);

        let fullItemsList = generateTimestampValues(maxNumOfItems, startTime, endTime, loadedBundleContext);

        if (fullItemsList) {
            sourcesData.forEach((source) => {
                fullItemsList.push(moment(source.FirstLogLineTimeStamp.split('T').join(' ')).format(TIMELINE_TIME_FORMAT).split('T').join(' '));
                fullItemsList.push(moment(source.LastLogLineTimeStamp.split('T').join(' ')).format(TIMELINE_TIME_FORMAT).split('T').join(' '));
            });
            fullItemsList = Array.from(new Set(fullItemsList));
            fullItemsList.sort((x1, x2) => timelineSorter(x1, x2));
        }

        setXAxisItems(fullItemsList ? fullItemsList : []);
    };

    useEffect(() => {
        if (logsCurrentTimestamp && loadedBundleContext.loadedBundleDurationMinutes && xAxisItems.length > 0) {
            const durationFromStart = getDurationInMin(xAxisItems[0], moment(logsCurrentTimestamp.split('T').join(' ')).format(TIMELINE_TIME_FORMAT));
            setProgressBarWidthPx((durationFromStart / loadedBundleContext.loadedBundleDurationMinutes) * resolutionPx);
        }
    }, [logsCurrentTimestamp, loadedBundleContext.loadedBundleDurationMinutes, xAxisItems]);

    useEffect(() => {
        if (resolutionPx && startTime && endTime && sourcesData) {
            generateXAxisItems();
        }
    }, [resolutionPx, startTime, endTime, sourcesData]);


    return (
        <Box className={classes.timeline} style={resolutionPx ? {width: `${resolutionPx}px`} : null}>
            <Box className={classes.timelineProgress}
                 style={{
                     width: `${progressBarWidthPx}px`,
                     backgroundColor: color
                 }}/>
            <Box id={"timeline-items-box"} className={classes.timelineItems}>
                {xAxisItems.map((item, i) => (
                    getItemRenderer(item, i)
                ))}
            </Box>
            {isArrowVisible &&
            <Box className={isArrowTop ? classes.arrowBoxTop : classes.arrowBoxBottom}>
                <Box className={isArrowTop ? dynamicClasses.timelineArrowTop : dynamicClasses.timelineArrowBottom}/>
            </Box>
            }
        </Box>
    )
};
export default BundleTimeline;