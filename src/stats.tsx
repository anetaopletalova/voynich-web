import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';
import { useApi } from './api/restApi';
import { useAuth } from './context/auth';
import { useMountEffect } from './helpers/hooks';
import { IClassificationParameters, IPageClassification } from './types/general';
import { toServerDateFormat } from './utils';

//TODO rename to better name (the file too)
//TO SAME CO ACCORDION, ALE NA KLIKNUTI SE NEZOBRAZI JEN MARKINGS, ALE I CELA STRANKA SE PODLE TOHO LOADNE... NEJLEPE VSE ZREFAKTOROVAT TED
const MyList = () => {
    const { authState } = useAuth();
    const { classificationApi } = useApi();
    const [classifications, setClassifications] = useState<IPageClassification[]>([]);
    const [selectedClassification, setSelectedClassification] = useState<IPageClassification | null>(null);

    const [page, setPage] = useState(0);
    const [totalItems, setTotalItems] = useState<number>(0);
    const [onlyWithNote, setOnlyWithNote] = useState(false);
    const [onlyFavorite, setOnlyFavorite] = useState(false);
    const [dateTo, setDateTo] = useState(new Date());
    const defaultParams = { page, dateTo: toServerDateFormat(dateTo) };
    const [params, setParams] = useState<IClassificationParameters>(defaultParams);

    const loadClassifications = async (params: IClassificationParameters = defaultParams) => {
        if (authState) {
            const res = await classificationApi.getAll(authState.userId, params);
            if (res.ok && res.data) {
                setClassifications(res.data.items);
                setTotalItems(res.data.totalItems);
            }
        }
    }

    useMountEffect(() => {
        loadClassifications();
    })

    return (
        <div>Stats</div>
    );
};

export default MyList;