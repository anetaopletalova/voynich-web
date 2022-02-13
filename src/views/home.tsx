import { Badge, Theme, useTheme } from '@mui/material';
import React, { useMemo, useState } from 'react';
import { useHistory } from 'react-router-dom';
import SearchInput from '../components/search';
import { useLookup } from '../context/data';
import { useMountEffect } from '../helpers/hooks';
import { IPage } from '../types/general';

interface IPageContainerProps {
    page: IPage;
}

const Home = () => {
    const [pages, setPages] = useState<IPage[]>([]);
    const [filteredPages, setFilteredPages] = useState<IPage[]>([]);
    const theme = useTheme();
    const styles = useMemo(() => createStyles(theme), [theme]);
    const {getPages} = useLookup();

    useMountEffect(() => {
        const loadPages = async () => {
            const res = await getPages();
            if (res) {
                setPages(res);
                setFilteredPages(res);
            }
        };

        loadPages();
    })

    const searchByText = (filterText: string) => {
        if (filterText === '') setFilteredPages(pages);
        const filtered = pages.filter(item => item.id.toString().indexOf(filterText) !== -1)
        setFilteredPages(filtered);
    };

    return (
        <>
            <div style={styles.searchContainer}>
                {/* nechat true??? */}
                <SearchInput onSearch={searchByText} onTextChange={true} />
            </div>
            <div style={styles.pagesContainer as React.CSSProperties}>
                {filteredPages &&
                    filteredPages.map(page => (
                        <PageContainer page={page} key={page.id} />
                    ))}
            </div>
        </>
    );
};

const PageContainer: React.FC<IPageContainerProps> = ({ page }) => {
    const history = useHistory();
    const theme = useTheme();
    const styles = useMemo(() => createStyles(theme), [theme]);

    const displayPage = () => {
        history.push(`/page/${page.id}`);
    };

    return (
        <div onClick={displayPage} style={styles.imagePreview}>
            <Badge color="secondary" badgeContent={`#${page.id}`} anchorOrigin={{
                vertical: 'top',
                horizontal: 'right',
            }}>
                <img src={`/previews/${page.name}`} alt={'voynich'} width={140} height={200} style={styles.pagePreview} />
            </Badge>
        </div>
    )
}

const createStyles = (theme: Theme) => (
    {
        imagePreview: {
            paddingLeft: '25px',
            paddingTop: '25px',
        },
        pagesContainer: {
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'center',
            paddingBottom: '25px',
        },
        pagePreview: {
            borderRadius: '7px',
        },
        searchContainer: {
            justifyContent: 'flex-end',
            display: 'flex',
            marginTop: '10px',
            marginRight: '15px',
        },
    }
);

export default Home;
