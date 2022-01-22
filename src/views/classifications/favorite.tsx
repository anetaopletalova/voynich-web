import React from 'react';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import StarIcon from '@mui/icons-material/Star';
import { IPageClassification } from '../../types/general';
import { useAuth } from '../../context/auth';
import { useApi } from '../../api/restApi';

interface IFavoriteStarProps {
    item: IPageClassification;
    onStarToggle: (item: IPageClassification) => void;
}

const FavoriteStar: React.FC<IFavoriteStarProps> = ({item, onStarToggle}) => {
    const { authState } = useAuth();
    const { classificationApi } = useApi();
    
    const addToFavorites = async (e, item: IPageClassification) => {
        e.preventDefault();
        e.stopPropagation();
        if (authState) {
            if (!item.favorite) {
                const res = await classificationApi.favorites.add(authState.userId, item.classificationId);
                if (res.ok && res.data) {
                    const updated = {
                        ...item,
                        favorite: res.data.favoriteId,
                    };
                    onStarToggle(updated);
                }
            } else {
                const res = await classificationApi.favorites.remove(authState.userId, item.favorite);
                if (res.ok) {
                    const updated = {
                        ...item,
                        favorite: null,
                    };
                    onStarToggle(updated);
                }
            }
        }
    }

    return (
        <div onClick={(e) => addToFavorites(e, item)}>
            {item.favorite ?
                <StarIcon color='primary' /> : <StarBorderIcon />
            }
        </div>
    )
}

export default FavoriteStar;