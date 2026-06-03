import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Pressable,
} from 'react-native';
import { useState } from 'react';
import Animated, { FadeIn, FadeOut, SlideInDown } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { TextInput } from 'react-native-gesture-handler';
import { defaultStyles } from '@/constants/Styles';
import Colors, { SAHEL } from '@/constants/Colors';
import { places } from '@/assets/data/places';
import { useRouter } from 'expo-router';
// @ts-expect-error — no bundled types for react-native-modern-datepicker
import DatePicker from 'react-native-modern-datepicker';

const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity);

export type BookingModalProps = {
  onClose: () => void;
};

const guestsGropus = [
  { name: 'Adults', text: 'Ages 13 or above', count: 0 },
  { name: 'Children', text: 'Ages 2-12', count: 0 },
  { name: 'Infants', text: 'Under 2', count: 0 },
  { name: 'Pets', text: 'Pets allowed', count: 0 },
];

export function LegacyBookingModal({ onClose }: BookingModalProps) {
  const [openCard, setOpenCard] = useState(0);
  const [selectedPlace, setSelectedPlace] = useState(0);
  const [groups, setGroups] = useState(guestsGropus);
  const today = new Date().toISOString().substring(0, 10);

  const onClearAll = () => {
    setSelectedPlace(0);
    setOpenCard(0);
  };

  return (
    <BlurView intensity={70} style={styles.container} tint="light">
      <Pressable onPress={onClose} style={styles.closeBtn} accessibilityLabel="Close booking modal">
        <Ionicons name="close" size={24} color={SAHEL.dark} />
      </Pressable>

      <View style={styles.card}>
        {openCard != 0 && (
          <AnimatedTouchableOpacity
            onPress={() => setOpenCard(0)}
            style={styles.cardPreview}
            entering={FadeIn.duration(200)}
            exiting={FadeOut.duration(200)}
          >
            <Text style={styles.previewText}>Where</Text>
            <Text style={styles.previewdData}>I&apos;m flexible</Text>
          </AnimatedTouchableOpacity>
        )}

        {openCard == 0 && <Text style={styles.cardHeader}>Where to?</Text>}
        {openCard == 0 && (
          <Animated.View entering={FadeIn} exiting={FadeOut} style={styles.cardBody}>
            <View style={styles.searchSection}>
              <Ionicons style={styles.searchIcon} name="search-outline" size={20} color={SAHEL.dark} />
              <TextInput
                style={styles.inputField}
                placeholder="Search destinations"
                placeholderTextColor={Colors.grey}
              />
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.placesContainer}
            >
              {places.map((item, index) => (
                <TouchableOpacity onPress={() => setSelectedPlace(index)} key={index}>
                  <Image
                    source={item.img}
                    style={selectedPlace == index ? styles.placeSelected : styles.place}
                  />
                  <Text style={{ fontFamily: 'mon', paddingTop: 6 }}>{item.title}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </Animated.View>
        )}
      </View>

      <View style={styles.card}>
        {openCard != 1 && (
          <AnimatedTouchableOpacity
            onPress={() => setOpenCard(1)}
            style={styles.cardPreview}
            entering={FadeIn.duration(200)}
            exiting={FadeOut.duration(200)}
          >
            <Text style={styles.previewText}>When</Text>
            <Text style={styles.previewdData}>Any week</Text>
          </AnimatedTouchableOpacity>
        )}

        {openCard == 1 && <Text style={styles.cardHeader}>When&apos;s your trip?</Text>}

        {openCard == 1 && (
          <Animated.View style={styles.cardBody}>
            <DatePicker
              options={{
                defaultFont: 'mon',
                headerFont: 'mon-sb',
                mainColor: Colors.primary,
                borderColor: 'transparent',
              }}
              current={today}
              selected={today}
              mode="calendar"
            />
          </Animated.View>
        )}
      </View>

      <View style={styles.card}>
        {openCard != 2 && (
          <AnimatedTouchableOpacity
            onPress={() => setOpenCard(2)}
            style={styles.cardPreview}
            entering={FadeIn.duration(200)}
            exiting={FadeOut.duration(200)}
          >
            <Text style={styles.previewText}>Who</Text>
            <Text style={styles.previewdData}>Add guests</Text>
          </AnimatedTouchableOpacity>
        )}

        {openCard == 2 && <Text style={styles.cardHeader}>Who&apos;s coming?</Text>}

        {openCard == 2 && (
          <Animated.View style={styles.cardBody}>
            {groups.map((item, index) => (
              <View
                key={index}
                style={[
                  styles.guestItem,
                  index + 1 < guestsGropus.length ? styles.itemBorder : null,
                ]}
              >
                <View>
                  <Text style={{ fontFamily: 'mon-sb', fontSize: 14 }}>{item.name}</Text>
                  <Text style={{ fontFamily: 'mon', fontSize: 14, color: Colors.grey }}>
                    {item.text}
                  </Text>
                </View>

                <View style={styles.guestControls}>
                  <TouchableOpacity
                    onPress={() => {
                      const newGroups = [...groups];
                      newGroups[index].count =
                        newGroups[index].count > 0 ? newGroups[index].count - 1 : 0;
                      setGroups(newGroups);
                    }}
                  >
                    <Ionicons
                      name="remove-circle-outline"
                      size={26}
                      color={groups[index].count > 0 ? Colors.grey : '#cdcdcd'}
                    />
                  </TouchableOpacity>
                  <Text style={styles.guestCount}>{item.count}</Text>
                  <TouchableOpacity
                    onPress={() => {
                      const newGroups = [...groups];
                      newGroups[index].count++;
                      setGroups(newGroups);
                    }}
                  >
                    <Ionicons name="add-circle-outline" size={26} color={Colors.grey} />
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </Animated.View>
        )}
      </View>

      <Animated.View style={defaultStyles.footer} entering={SlideInDown.delay(200)}>
        <View style={styles.footerRow}>
          <TouchableOpacity style={styles.clearBtn} onPress={onClearAll}>
            <Text style={styles.clearText}>Clear all</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[defaultStyles.btn, styles.searchBtn]}
            onPress={onClose}
          >
            <Ionicons
              name="search-outline"
              size={24}
              style={defaultStyles.btnIcon}
              color="#fff"
            />
            <Text style={defaultStyles.btnText}>Search</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </BlurView>
  );
}

/** Expo Router modal screen — wires router.back() into explicit onClose. */
export default function BookingModalScreen() {
  const router = useRouter();
  return <LegacyBookingModal onClose={() => router.back()} />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 100,
    backgroundColor: SAHEL.background,
  },
  closeBtn: {
    position: 'absolute',
    top: 56,
    right: 20,
    zIndex: 10,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: SAHEL.card,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: SAHEL.border,
  },
  card: {
    backgroundColor: SAHEL.card,
    borderRadius: 14,
    margin: 10,
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 4,
    shadowOffset: { width: 2, height: 2 },
    gap: 20,
    borderWidth: 1,
    borderColor: SAHEL.border,
  },
  cardHeader: {
    fontFamily: 'mon-b',
    fontSize: 24,
    padding: 20,
    color: SAHEL.dark,
  },
  cardBody: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  cardPreview: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
  },
  searchSection: {
    height: 50,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: SAHEL.card,
    borderWidth: 1,
    borderColor: SAHEL.border,
    borderRadius: 8,
    marginBottom: 16,
  },
  searchIcon: {
    padding: 10,
  },
  inputField: {
    flex: 1,
    padding: 10,
    backgroundColor: SAHEL.card,
    fontFamily: 'mon',
    color: SAHEL.dark,
  },
  placesContainer: {
    flexDirection: 'row',
    gap: 25,
  },
  place: {
    width: 100,
    height: 100,
    borderRadius: 10,
  },
  placeSelected: {
    borderColor: Colors.primary,
    borderWidth: 2,
    borderRadius: 10,
    width: 100,
    height: 100,
  },
  previewText: {
    fontFamily: 'mon-sb',
    fontSize: 14,
    color: Colors.grey,
  },
  previewdData: {
    fontFamily: 'mon-sb',
    fontSize: 14,
    color: Colors.dark,
  },
  guestItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
  },
  guestControls: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  guestCount: {
    fontFamily: 'mon',
    fontSize: 16,
    minWidth: 18,
    textAlign: 'center',
  },
  itemBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: SAHEL.border,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  clearBtn: {
    height: '100%',
    justifyContent: 'center',
  },
  clearText: {
    fontSize: 18,
    fontFamily: 'mon-sb',
    textDecorationLine: 'underline',
    color: SAHEL.dark,
  },
  searchBtn: {
    paddingRight: 20,
    paddingLeft: 50,
  },
});
