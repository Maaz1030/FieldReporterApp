import React from 'react';
import { View } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import ReportCard from './ReportCard';
import SwipeableReportCard from './SwipeableReportCard';

export default function ReportList({
  reports,
  theme,
  navigation,
  t,
  swipeToDelete = false,
  onDelete,
}) {
  const CardComponent = swipeToDelete ? SwipeableReportCard : ReportCard;

  return (
    <View style={{ flex: 1 }}>
      <FlashList
        data={reports}
        keyExtractor={(item, index) => item.id?.toString() || index.toString()}
        estimatedItemSize={110}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <CardComponent
            item={item}
            theme={theme}
            navigation={navigation}
            t={t}
            onDelete={onDelete}
          />
        )}
      />
    </View>
  );
}