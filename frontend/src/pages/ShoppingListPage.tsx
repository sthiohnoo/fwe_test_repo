import { BaseLayout } from '../layout/BaseLayout.tsx';
import { useApiClient } from '../hooks/useApiClient.ts';
import React, { useCallback, useEffect, useState } from 'react';
import {
  PostShoppingListsRequest,
  PutShoppingListsIdRequest,
  PutShoppingListsShoppingListIdFavoritesRequest,
  PutShoppingListsShoppingListIdItemsItemIdRequest,
  ShoppingList,
} from '../adapter/api/__generated';
import { Box, Button, HStack, IconButton, Input, Select, useDisclosure } from '@chakra-ui/react';
import { ShoppingListTable } from './components/ShoppingListTable.tsx';
import { CreateShoppingListModal } from './components/CreateShoppingListModal.tsx';
import { AddItemFormValues, AddItemTableModal } from '../components/AddItemTableModal.tsx';
import axios from 'axios';
import { SearchIcon, StarIcon } from '@chakra-ui/icons';
import { IoHomeOutline } from 'react-icons/io5';
import { SearchOpenFoodApiModal } from '../components/SearchOpenFoodApiModal.tsx';

export const ShoppingListPage = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const {
    isOpen: isItemTableOpen,
    onOpen: onItemTableOpen,
    onClose: onItemTableClose,
  } = useDisclosure(); // Disclosure for ItemTable
  const {
    isOpen: isOpenFoodOpen,
    onOpen: onOpenFoodOpen,
    onClose: onOpenFoodClose,
  } = useDisclosure(); // Disclosure for SearchOpenFoodApiModal

  const client = useApiClient();
  const [shoppingLists, setShoppingLists] = useState<ShoppingList[]>([]);

  const loadShoppingLists = useCallback(async () => {
    const res = await client.getShoppingLists();
    setShoppingLists(res.data);
  }, [client]);

  useEffect(() => {
    loadShoppingLists();
  }, [loadShoppingLists]);

  const onCreateShoppingList = async (data: PostShoppingListsRequest) => {
    await client.postShoppingLists(data);
    await loadShoppingLists();
    onClose();
  };

  const onDeleteShoppingList = async (list: ShoppingList) => {
    await client.deleteShoppingListsId(list.id);
    await loadShoppingLists();
    setShoppingListToBeUpdated(null);
  };

  const [shoppingListsToBeUpdated, setShoppingListToBeUpdated] = useState<ShoppingList | null>(
    null,
  );
  const onClickUpdateShoppingList = async (list: ShoppingList) => {
    setShoppingListToBeUpdated(list);
    onOpen();
  };
  const onUpdateShoppingList = async (list: PutShoppingListsIdRequest) => {
    await client.putShoppingListsId(shoppingListsToBeUpdated?.id ?? '', list);

    await loadShoppingLists();
    onClose();
    setShoppingListToBeUpdated(null);
  };

  const onClickOpenItemListToAdd = async (list: ShoppingList) => {
    onItemTableOpen();
    setShoppingListToBeUpdated(list);
  };
  const onSubmitAddItemToShoppingList = async (values: AddItemFormValues) => {
    if (shoppingListsToBeUpdated) {
      const request: PutShoppingListsShoppingListIdItemsItemIdRequest = {
        quantity: parseInt(values.quantity as unknown as string, 10),
        isPurchased: String(values.isPurchased) === 'true',
      };

      await client.putShoppingListsShoppingListIdItemsItemId(
        shoppingListsToBeUpdated.id,
        values.id,
        request,
      );
      await loadShoppingLists();
    }
  };

  const onClickDeleteItem = async (list: ShoppingList, itemId: string) => {
    await client.deleteShoppingListsShoppingListIdItemsItemId(list.id, itemId);
    await loadShoppingLists();
  };

  const [searchType, setSearchType] = useState('name');
  const handleSearchNameOrDescChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const searchValue = e.target.value;

    if (searchValue === '') {
      await loadShoppingLists();
      return;
    }

    try {
      const params = {
        [searchType]: searchValue,
      };
      const res = await client.getShoppingListsSearch(params.name, params.description);

      const res2: ShoppingList[] = [];
      for (const item of res.data) {
        const shoppingListResponse = await client.getShoppingListsId(item.id);
        res2.push(shoppingListResponse.data);
      }
      setShoppingLists(res2.length > 0 ? res2 : []);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 404) {
          setShoppingLists([]);
        }
      } else {
        console.error('Unexpected error:', error);
      }
    }
  };
  const handleSearchItemChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const searchValue = e.target.value;

    if (searchValue === '') {
      await loadShoppingLists();
      return;
    }

    try {
      const itemRes = await client.getItemsNameItemName(searchValue);
      const itemIds = itemRes.data.id;

      const res = await client.getShoppingListsItemsItemId(itemIds);

      const res2: ShoppingList[] = [];
      for (const item of res.data) {
        const shoppingListResponse = await client.getShoppingListsId(item.listId);
        res2.push(shoppingListResponse.data);
      }
      setShoppingLists(res2.length > 0 ? res2 : []);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 404) {
          setShoppingLists([]);
        }
      } else {
        console.error('Unexpected error:', error);
      }
    }
  };

  const [isShowingFavorites, setIsShowingFavorites] = useState(false);
  const onClickToggleFavorite = async (list: ShoppingList) => {
    const request: PutShoppingListsShoppingListIdFavoritesRequest = {
      isFavorite: !list.isFavorite,
    };
    await client.putShoppingListsShoppingListIdFavorites(list.id, request);

    if (isShowingFavorites) {
      const res = await client.getShoppingListsSearchFavorites();
      setShoppingLists(res.data);
    } else {
      setShoppingLists((prevLists) =>
        prevLists.map((item) =>
          item.id === list.id ? { ...item, isFavorite: !item.isFavorite } : item,
        ),
      );
    }
  };
  const onClickShowFavorites = async () => {
    const res = await client.getShoppingListsSearchFavorites();
    setShoppingLists(res.data);
    setIsShowingFavorites(true);
  };
  const onClickShowAll = async () => {
    await loadShoppingLists();
    setIsShowingFavorites(false);
  };

  // Freestyle Task #2
  const onClickOpenOpenFoodApiModal = async () => {
    onOpenFoodOpen();
  };

  return (
    <BaseLayout>
      <Box>
        <HStack spacing={3} mb={4}>
          <Button
            variant={'solid'}
            colorScheme={'blue'}
            onClick={() => {
              setShoppingListToBeUpdated(null);
              onOpen();
            }}
            flex="0 0 15%"
          >
            Create new ShoppingList
          </Button>
          <Box border="1px" borderColor="blue" borderRadius="md" display="flex" flex="1">
            <Select
              value={searchType}
              onChange={(e) => setSearchType(e.target.value)}
              flex=" 0 0 25%"
            >
              <option value="name">Name</option>
              <option value="description">Description</option>
            </Select>
            <Input
              placeholder={`Search ShoppingList by ${searchType}`}
              onChange={handleSearchNameOrDescChange}
              flex="1"
              border="none"
            />
          </Box>
          <Input
            placeholder="Search ShoppingList by included item"
            onChange={handleSearchItemChange}
            flex="1"
            border="1px"
            borderColor="blue"
            borderRadius="md"
          />
          <IconButton
            aria-label={'Show Favorites'}
            icon={<StarIcon color="yellow.400" />}
            onClick={() => onClickShowFavorites()}
          />{' '}
          <IconButton
            aria-label={'Show All'}
            icon={<IoHomeOutline />}
            onClick={() => onClickShowAll()}
          />{' '}
          <IconButton // Freestyle Task #2
            aria-label={'Search Open Food'}
            icon={<SearchIcon />}
            onClick={() => onClickOpenOpenFoodApiModal()}
          />{' '}
        </HStack>
        <CreateShoppingListModal
          initialValues={shoppingListsToBeUpdated}
          isOpen={isOpen}
          onClose={onClose}
          onSubmit={(updatedShoppingList) => {
            const updatedItems =
              updatedShoppingList.items?.map((item) => {
                return { id: item.id ?? '', name: item.name };
              }) ?? [];

            if (shoppingListsToBeUpdated) {
              // TODO: i cannot update the items(quantity and ispurchased)
              onUpdateShoppingList({ ...updatedShoppingList, items: updatedItems });
            } else {
              onCreateShoppingList({ ...updatedShoppingList });
            }
          }}
        />
        <SearchOpenFoodApiModal isOpen={isOpenFoodOpen} onClose={onOpenFoodClose} />{' '}
        <AddItemTableModal
          isOpen={isItemTableOpen}
          onClose={onItemTableClose}
          onSubmit={onSubmitAddItemToShoppingList}
        />{' '}
        <ShoppingListTable
          data={shoppingLists}
          onClickDeleteShoppingList={onDeleteShoppingList}
          onClickUpdateShoppingList={onClickUpdateShoppingList}
          onClickAddItemToShoppingList={onClickOpenItemListToAdd}
          onClickDeleteItem={onClickDeleteItem}
          onClickToggleFavorite={onClickToggleFavorite}
        />
      </Box>
    </BaseLayout>
  );
};
