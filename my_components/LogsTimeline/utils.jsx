import moment from "moment";
import {TIMELINE_TIME_DIFF, TIMELINE_TIME_FORMAT} from "../../constants";

export const timelineSorter = (x1, x2) => {
    const x1Moment = moment(x1, TIMELINE_TIME_FORMAT);
    const x2Moment = moment(x2, TIMELINE_TIME_FORMAT);
    if (x1Moment.isBefore(x2Moment)) {
        return -1;
    }
    if (x1Moment.isAfter(x2Moment)) {
        return 1;
    }
    return 0;
};

export const generateTimestampValues = (maxNumberOfItems, startTime, endTime, loadedBundleContext = null) => {
    if (startTime && endTime){
        const startTimeMoment = moment(startTime.split('T').join(' '));
        const endTimeMoment = moment(endTime.split('T').join(' '));
        let duration = moment.duration(endTimeMoment.diff(startTimeMoment));
        let minutes = duration.asMinutes();
        if (loadedBundleContext){
            loadedBundleContext.setLoadedBundleDurationMinutes(minutes);
        }

        const timelineSpread = minutes / maxNumberOfItems;

            let fullItemsList = [];
        for (let i = 0; i <= maxNumberOfItems; i++) {
            if (i === 0) {
                fullItemsList.push(startTimeMoment.format(TIMELINE_TIME_FORMAT).split('T').join(' '));
            } else if (i === maxNumberOfItems) {
                fullItemsList.push(endTimeMoment.format(TIMELINE_TIME_FORMAT).split('T').join(' '));
            } else {
                const timestamp = startTimeMoment.add(timelineSpread, 'minutes')
                    .format(TIMELINE_TIME_FORMAT).split(' ').join(' ');
                fullItemsList.push(timestamp);
            }
        }
        return fullItemsList;
    }

    return null
};

export const getDurationInMin = (startTime, endTime) => {
    if (startTime && endTime){
        const startTimeMoment = moment(startTime.split('T').join(' '), TIMELINE_TIME_FORMAT);
        const endTimeMoment = moment(endTime.split('T').join(' '), TIMELINE_TIME_FORMAT);
        return moment.duration(endTimeMoment.diff(startTimeMoment)).asMinutes();
    } else{
        return 0;
    }
};

export const getDurationInSec = (startTime, endTime) => {
    const startTimeMoment = moment(startTime.split('T').join(' '));
    const endTimeMoment = moment(endTime.split('T').join(' '));
    return moment.duration(endTimeMoment.diff(startTimeMoment)).asSeconds();
};

export const getSiteNameWithoutDate = (siteName) => {
    const regex = /\d{4}/;
    const dateStartIndex = siteName.search(regex);

    return siteName.substring(0, dateStartIndex - 1);
};