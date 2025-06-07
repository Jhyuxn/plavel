'use client';

import { useEffect, useRef, useState } from 'react';
import { Bell, Search, HomeIcon, MapPin, UserCircle2 } from 'lucide-react';
import { motion, useScroll, useSpring, useTransform } from 'framer-motion';
import { useInfiniteQuery } from '@tanstack/react-query';
import { PageTransition } from '@/components/PageTransition';

// 임시 데이터 로딩 함수
const fetchData = async (page: number) => {
  await new Promise(resolve => setTimeout(resolve, 1000)); // 임시 딜레이
  return {
    items: Array.from({ length: 10 }, (_, i) => ({
      id: page * 10 + i,
      title: `여행 ${page * 10 + i + 1}`,
      date: new Date().toISOString(),
    })),
    nextPage: page + 1,
  };
};

export default function Home() {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const pullToRefreshRef = useRef<HTMLDivElement>(null);
  const { scrollY } = useScroll();
  const pullProgress = useSpring(0, { stiffness: 400, damping: 30 });

  const pullToRefreshHeight = useTransform(pullProgress, [0, 100], [0, 150]);
  const opacity = useTransform(pullProgress, [0, 50, 100], [0, 0.5, 1]);

  // 무한 스크롤 쿼리
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } = useInfiniteQuery({
    queryKey: ['trips'],
    queryFn: ({ pageParam = 0 }) => fetchData(pageParam),
    getNextPageParam: (lastPage) => lastPage.nextPage,
    initialPageSize: 10,
  });

  // 당겨서 새로고침 로직
  useEffect(() => {
    let touchStart = 0;
    let pulling = false;

    const handleTouchStart = (e: TouchEvent) => {
      if (scrollRef.current?.scrollTop === 0) {
        touchStart = e.touches[0].clientY;
        pulling = true;
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!pulling) return;

      const touch = e.touches[0].clientY;
      const pull = Math.max(0, (touch - touchStart) * 0.5);
      pullProgress.set(pull);

      if (pull > 100) {
        setIsRefreshing(true);
      }
    };

    const handleTouchEnd = async () => {
      if (!pulling) return;

      pulling = false;
      pullProgress.set(0);

      if (isRefreshing) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        setIsRefreshing(false);
      }
    };

    const element = scrollRef.current;
    if (element) {
      element.addEventListener('touchstart', handleTouchStart);
      element.addEventListener('touchmove', handleTouchMove);
      element.addEventListener('touchend', handleTouchEnd);

      return () => {
        element.removeEventListener('touchstart', handleTouchStart);
        element.removeEventListener('touchmove', handleTouchMove);
        element.removeEventListener('touchend', handleTouchEnd);
      };
    }
  }, [pullProgress, isRefreshing]);

  // 무한 스크롤 로직
  useEffect(() => {
    const handleScroll = () => {
      const element = scrollRef.current;
      if (!element) return;

      const { scrollTop, scrollHeight, clientHeight } = element;
      if (scrollHeight - scrollTop <= clientHeight * 1.5 && hasNextPage && !isFetchingNextPage) {
        fetchNextPage();
      }
    };

    const element = scrollRef.current;
    if (element) {
      element.addEventListener('scroll', handleScroll);
      return () => element.removeEventListener('scroll', handleScroll);
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  return (
    <PageTransition>
      <main className="min-h-screen flex flex-col">
        {/* Header */}
        <header className="fixed top-0 left-0 right-0 flex justify-between items-center px-4 py-3 bg-[#1C1C1E]/80 backdrop-blur-md z-50">
          <h1 className="text-2xl font-bold italic text-purple-500">Plavel</h1>
          <div className="flex gap-2">
            <button className="touch-feedback p-2">
              <Search className="w-6 h-6 text-white" />
            </button>
            <button className="touch-feedback p-2">
              <Bell className="w-6 h-6 text-white" />
            </button>
          </div>
        </header>

        {/* Pull to Refresh Indicator */}
        <motion.div
          ref={pullToRefreshRef}
          style={{ height: pullToRefreshHeight, opacity }}
          className="fixed top-0 left-0 right-0 flex items-center justify-center bg-purple-500/20 z-40"
        >
          <span className="text-sm text-white">
            {isRefreshing ? '새로고침 중...' : '당겨서 새로고침'}
          </span>
        </motion.div>

        {/* Main Content */}
        <div
          ref={scrollRef}
          className="flex-1 mt-[60px] mb-[84px] momentum-scroll overflow-auto"
        >
          <div className="p-4 space-y-4">
            {data?.pages.map((page) =>
              page.items.map((item) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-[#2C2C2E] p-4 rounded-lg"
                >
                  <h3 className="text-lg font-bold">{item.title}</h3>
                  <p className="text-sm text-gray-400">{item.date}</p>
                </motion.div>
              ))
            )}
            {isFetchingNextPage && (
              <div className="py-4 text-center text-gray-400">
                로딩 중...
              </div>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className="fixed bottom-0 left-0 right-0 bg-[#1C1C1E]/80 backdrop-blur-md border-t border-white/10">
          <div className="flex justify-around py-3 pb-[calc(env(safe-area-inset-bottom)+12px)]">
            <button className="touch-feedback flex flex-col items-center">
              <HomeIcon className="w-6 h-6" />
              <span className="text-xs mt-1">홈</span>
            </button>
            <button className="touch-feedback flex flex-col items-center">
              <MapPin className="w-6 h-6" />
              <span className="text-xs mt-1">여행정보</span>
            </button>
            <button className="touch-feedback flex flex-col items-center">
              <UserCircle2 className="w-6 h-6" />
              <span className="text-xs mt-1">마이페이지</span>
            </button>
          </div>
        </nav>
      </main>
    </PageTransition>
  );
} 